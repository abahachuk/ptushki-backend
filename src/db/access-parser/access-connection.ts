// eslint-disable-next-line import/no-extraneous-dependencies
import ADODB from 'node-adodb';

const accessConnection = ADODB.open(
  'Provider=Microsoft.ACE.OLEDB.12.0;Data Source=MBCRB(2007-30.01.2012).mdb;Persist Security Info=False;',
);

export default accessConnection;
