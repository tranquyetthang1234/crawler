"use strict"

import express from "express";
import rakumaController from "../../controllers/rakuma.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()


router.get("/category", helper.asyncHandler(rakumaController.crawlCategory))
router.get("/detail", helper.asyncHandler(rakumaController.getInfoDetail))
router.get("/search", helper.asyncHandler(rakumaController.searchDetail))

export default router