import { Dict } from './dict';

export type Module = {
  run: (params: Dict<unknown>) => Promise<void>,
}
