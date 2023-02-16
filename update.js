async udpateProfileInfo(req, res) {
    try {
      const query = {
        key: req.body.key,
        title: req.body.title,
        status: req.body.status,
      };

      const docId = req.body._id;

      delete req.body._id;

      let setTitle = `${query.key}.$[el].title`;
      let setStatus = `${query.key}.$[el].status`;

      //check if element exists
      const foundElement = await profileInfoSchema.findOne(
        {
          _id: docId,
        },
        { [query.key]: { $elemMatch: { title: [query.title] } } }
      );

      let updatedProfileInfos = null;

      //if element found then update
      if (foundElement && foundElement[query.key].length) {
        updatedProfileInfos = await profileInfoSchema.findOneAndUpdate(
          {
            _id: docId,
          },
          {
            $set: {
              [setTitle]: query.title,
              [setStatus]: query.status,
            },
          },
          {
            arrayFilters: [{ "el.title": req.body.title }],
            new: true,
          }
        );
      } else {
        updatedProfileInfos = await profileInfoSchema.findOneAndUpdate(
          {
            _id: docId,
          },
          { $push: { [query.key]: { ...req.body } } }
        );
      }

      await updatedProfileInfos.save();

      if (!updatedProfileInfos) {
        return res.status(500).json({ error: "Failed to update about us!" });
      }

      res.status(201).json({
        message: "About us updated sucessfully",
        data: updatedProfileInfos,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Unable to update about us!" });
    }
  }
