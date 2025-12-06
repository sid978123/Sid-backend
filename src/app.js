// import express from "express";
// import cookieParser from "cookie-parser";
// import cors from "cors";

// const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "16kb" })); // only for JSON data...
// app.use(express.urlencoded({ extended: true, limit: "16kb" })); // only for form data .....  Here we use extended : true because wee ca parse form data so that it can visible in good way and able to understand
// app.use(express.static("public")); //it is used to store the assets like images and pdf , what we upload...

// app.use(cookieParser()); // we use this so that we can change cookies of the user...

// export { app };

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

//routes import ....

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
