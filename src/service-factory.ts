import { DefaultServiceFactory } from 'typescript-rest';

import InitialDataController from './controllers/initial-data-controller';

const instances = new Map();

export class CustomServiceFactory extends DefaultServiceFactory {
  public create(ServiceClass: any) {
    if (!instances.get(ServiceClass)) {
      instances.set(ServiceClass, new ServiceClass());
    }
    return instances.get(ServiceClass);
  }
}

const services = [InitialDataController];

const getServiceFactory = async (): Promise<CustomServiceFactory> => {
  await Promise.all(
    services.map(async ServiceClass => {
      const service = new ServiceClass();
      if (service.heatUp) {
        await service.heatUp();
      }
      instances.set(ServiceClass, service);
    }),
  );

  return new CustomServiceFactory();
};

export default getServiceFactory;
