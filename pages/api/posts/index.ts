import dbConnect from "../../../utils/dbConnect";
import NewPost from "../../../models/NewPost";
import type { NextApiRequest, NextApiResponse } from "next";

dbConnect();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const posts = await NewPost.find({});

        res.status(200).json({ success: true, data: posts });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "POST":
      try {
        const post = await NewPost.create(req.body);

        res.status(201).json({ success: true, data: post });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
};
