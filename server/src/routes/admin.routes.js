import { Router } from "express";
import {
  getAllContacts,
  deleteContact,
} from "../controllers/contact.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET /api/admin/contacts — Fetch all submitted contacts
|--------------------------------------------------------------------------
*/

router.get("/contacts", getAllContacts);

/*
|--------------------------------------------------------------------------
| DELETE /api/admin/contacts/:id — Delete a contact by ID
|--------------------------------------------------------------------------
*/

router.delete("/contacts/:id", deleteContact);

export default router;
