import { Router } from "express";
import assignin from "lodash.assignin";
import {
  hasAuthorization,
  requireSignIn,
} from "../middlewares/auth.middleware.mjs";
import User from "../models/user.model.mjs";

const router = Router();

router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", async (req, res) => {
  const users = await User.find().select("-hashedPassword -salt");
  res.json(users);
});

router.param("userId", async (req, res, next, id) => {
  try {
    let user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ message: `User with id='${id}' not found` });
    req.profile = user;
    next();
  } catch (err) {
    res.status(400).json(err);
  }
});

router
  .route("/:userId")
  .get(requireSignIn, (req, res) => {
    req.profile.hashedPassword = undefined;
    req.profile.salt = undefined;
    res.json(req.profile);
  })
  .put(requireSignIn, hasAuthorization, async (req, res) => {
    try {
      // if user is changing email, the email must be unique
      if (req.body.email && req.body.email.trim() !== req.profile.email) {
        let u = new User(req.body);
        u.password = "random-string";
        u._id = undefined;
        await u.validate();
      }
      let user = assignin(req.profile, req.body);
      user = await user.save();
      user.hashedPassword = undefined;
      user.salt = undefined;
      res.json(user);
    } catch (err) {
      res.status(400).json(err);
    }
  })
  .delete(requireSignIn, hasAuthorization, async (req, res) => {
    try {
      await req.profile.remove();
      req.profile.hashedPassword = undefined;
      req.profile.salt = undefined;
      res.json(req.profile);
    } catch (err) {
      res.status(400).json(err);
    }
  });

export default router;
