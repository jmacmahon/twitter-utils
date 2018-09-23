import { Dict } from './dict'

export interface Module {
  run: (params: Dict<unknown>) => Promise<void>
}
