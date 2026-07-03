import { Router } from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
} from "../controllers/contact.controller.js";
import validate from "../middlewares/validate.middleware.js";
import contactLimiter from "../middlewares/rateLimit.middleware.js";
import contactSchema from "../schemas/contact.schema.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| POST /api/contact  — multer handles file, then validate body, then create
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  contactLimiter,
  upload.single("image"),   // field name must match form's name="image"
  validate(contactSchema),
  createContact
);

router.get("/", getAllContacts);

router.delete("/:id", deleteContact);

export default router;