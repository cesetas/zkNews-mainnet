import dbConnect from "../../../utils/dbConnect";
import NewPost from "../../../models/NewPost";
import type { NextApiRequest, NextApiResponse } from "next";

dbConnect();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { _id },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        const post = await NewPost.findById(_id);

        if (!post) {
          return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: post });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "PUT":
      try {
        const post = await NewPost.findByIdAndUpdate(_id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!post) {
          return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: post });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "DELETE":
      try {
        const deletedPost = await NewPost.deleteOne({ _id: _id });

        if (!deletedPost) {
          return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
};
