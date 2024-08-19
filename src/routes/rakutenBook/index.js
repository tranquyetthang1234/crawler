"use strict"

import express from "express";
import rakutenBookController from "../../controllers/rakutenBook.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()


router.get("/category", helper.asyncHandler(rakutenBookController.crawlCategory))
router.get("/detail", helper.asyncHandler(rakutenBookController.getInfoDetail))
router.get("/search", helper.asyncHandler(rakutenBookController.searchDetail))

export default router