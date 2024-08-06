import { remultExpress} from 'remult/remult-express';
import { Record } from '../shared/record';

export const api = remultExpress({
    entities:[Record]
})