import { Entity, Fields } from 'remult';

@Entity('records', {allowApiCrud : true,})
export class Record {
    @Fields.string({
        dbName: '_id',
        valueConverter: {
          fieldTypeInDb: 'dbid',
        },
      })
    id: string = ''
    @Fields.string()
    username = '';
    @Fields.integer()
    score = 0;
}