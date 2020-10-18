import { Request, Response } from "express";
import { getRepository } from "typeorm";
import OrphanageValidation from "../validations/OrphanageValidation";

import Orphanage from "../models/Orphanage";
import OrphanageView from "../views/OrphanageView";

export default {
  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      relations: ["images"],
    });
    return res.json(OrphanageView.renderMany(orphanages));
  },

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const orphanagesRepository = getRepository(Orphanage);
    const orphanage = await orphanagesRepository.findOne(id, {
      relations: ["images"],
    });

    if (!orphanage)
      return res.status(404).json({
        error: `The orphanage with the code ${id} could not be found`,
      });
    return res.json(OrphanageView.render(orphanage));
  },

  async store(req: Request, res: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = req.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = req.files as Express.Multer.File[];
    const images = requestImages.map((image) => {
      return { path: image.filename };
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends === "true",
      images,
    };

    await OrphanageValidation.validate(data);

    const orphanage = orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);
    return res.status(201).json(orphanage);
  },
};
