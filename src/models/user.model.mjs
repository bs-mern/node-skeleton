import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /.+\@.+\..+/.test(v);
        },
        message: (props) => `"${props.value}" is not a valid email address`,
      },
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required"],
    },
    salt: String,
  },
  { timestamps: true }
);

UserSchema.path("email").validate(async function (v) {
  if (this.isNew) {
    let User = mongoose.model("User", UserSchema);
    var users = await User.find({ email: v });
    if (users.length > 0) return false;
    return true;
  }
}, "Email already taken");

UserSchema.path("hashedPassword").validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);

UserSchema.methods = {
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()).toString();
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
};

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

export default mongoose.model("User", UserSchema);
