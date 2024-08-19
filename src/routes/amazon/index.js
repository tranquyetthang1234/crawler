"use strict"

import express from "express";
import amazonController from "../../controllers/amazon.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()

router.get("/category", helper.asyncHandler(amazonController.crawlCategory))
router.get("/detail", helper.asyncHandler(amazonController.getInfoDetail))

export default router