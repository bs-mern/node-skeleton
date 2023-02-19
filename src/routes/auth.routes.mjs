import { Router } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { JWT_SECRET } from "../config.mjs";
import User from "../models/user.model.mjs";

const router = Router();

router.post(
  "/login",
  body("email").notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(401).json({ error: "User not found" });
      if (!user.authenticate(req.body.password))
        return res
          .status(401)
          .json({ error: "Email and Password don't match." });
      const token = jwt.sign({ _id: user._id }, JWT_SECRET);
      res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      res.json(err);
    }
  }
);

export default router;
