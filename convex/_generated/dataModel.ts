export type Id<TableName extends string> = string & { __tableName: TableName };

export interface Doc {
  _id: Id<any>;
  _creationTime: number;
}

export interface DataModel {
  users: Doc;
  templates: Doc;
  meetings: Doc;
}
