"use strict"

import express from "express";
import mercariController from "../../controllers/mercari.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()

router.get("/category", helper.asyncHandler(mercariController.getListCategory))
export default router