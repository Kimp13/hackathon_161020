const jsonify = require("../../../utils/searchToJson");

module.exports = async (req, res) => {
  const schoolId = parseInt(jsonify(req.search).schoolId, 10);

  if (schoolId) {
    const response = await wonder.knex
      .select('*')
      .from('class')
      .where('school_id', schoolId);

    res.send(response);
    return;
  }

  res.throw(400);
  return;
};