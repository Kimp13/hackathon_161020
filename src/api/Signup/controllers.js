module.exports = async (req, res) => {
  res.send({
    roles: await wonder.knex
      .select('*')
      .from('role')
      .whereIn('type', ['student', 'teacher']),
    schools: await wonder.knex
      .select('*')
      .from('school')
  });
};