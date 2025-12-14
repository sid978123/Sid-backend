import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// //📃📃register user controller......................

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // 1️⃣ Validate input
  if (
    [fullName, username, email, password].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2️⃣ Check if user exists
  const existedUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // 3️⃣ Avatar (required)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // 4️⃣ Cover image (optional)
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // 5️⃣ Create user
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // 6️⃣ Safe response object
  const createdUser = {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    coverImage: user.coverImage,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// //📃📃login user controller......................

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || !(username || email)) {
    throw new ApiError(404, "All fields are required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const loggedInUser = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    coverImage: user.coverImage,
  };

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: loggedInUser }, "user loggedIn successfully")
    );
});

// //📃📃logout user controller......................

const logoutUser = asyncHandler(async (req, res) => {
  //step 1 here we are taking the userId if user exist
  const userId = req.user?._id;
  //2. step2 here we are validating userId
  if (!userId) {
    throw new ApiError(404, "  Unauthorised request  ");
  }
  //step3 here we are removing our refresh tokens.....
  await User.findByIdAndUpdate(
    userId,

    { $unset: { refreshToken: "" } },

    { new: false }
  );

  //step 4 here we are removing our cookies

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
