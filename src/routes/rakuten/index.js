"use strict"

import express from "express";
import rakutenController from "../../controllers/rakuten.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()


router.get("/category", helper.asyncHandler(rakutenController.crawlCategory))
router.get("/detail", helper.asyncHandler(rakutenController.getInfoDetail))
router.get("/search", helper.asyncHandler(rakutenController.searchDetail))

export default router