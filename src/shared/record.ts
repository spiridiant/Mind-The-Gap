import { Entity, Fields } from 'remult';

@Entity('records', {allowApiCrud : true,})
export class Record {
    @Fields.autoIncrement()
    id = 0;
    @Fields.string()
    username = '';
    @Fields.integer()
    score = 0;
}