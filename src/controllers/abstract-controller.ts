import { Router } from 'express';

export default abstract class AbstractController {
  public abstract init(): Router;
}
