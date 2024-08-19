"use strict"

import express from "express";
import yahooAuctionController from "../../controllers/yahooAuction.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()


router.get("/detail", helper.asyncHandler(yahooAuctionController.getInfoDetail))

export default router