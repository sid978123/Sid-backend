// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, username, password } = req.body;

//   // if(fullName ==="") {
//   //   throw new ApiError(400 , "fullname is required")
//   // }

//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required..");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User is already existed");
//   }
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage[0]?.path;

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const user = await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "", // if coverImage path exist then extract url and if not then remain empty..
//     email,
//     password,
//     username: username.toLowerCase(),
//   });
//   const createdUser = await User.findById(user._1d).select(
//     "-password -refreshToken"
//   ); //here we are deleting the password and refreshToken

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registered successfully "));
// });

// export { registerUser };

//   //get user details from the frontend
//   //verify that data that send by the user (validation) - not empty
//   //check if user is already exist [ check by username or emails]
//   //check if avatar is exist or not [ avatar , coverImage]
//   //upload them to cloudinary , avatar
//   //create user Object - create entry in db
//   //remove password and refresh Token field
//   //check for user creation
//   //return res

import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";

//step 1 here we are taking input data from the req.body
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email, fullName } = req.body;

  //step2 here we are validating the input whether it is valid or not ..[empty or not]
  if (
    [username, password, email, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //step3 check if user is already exist or not..
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User is already exist");
  }

  //step 4 get local file paths for avatar and cover image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //step 5 check if avatar exists locally
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //step 6 upload avatar and optional cover image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //step 7 create user in database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //step 8 remove sensitive data before sending response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "user registerred successfully"));
});

export { registerUser };
