const pick = require('lodash/pick');
const merge = require('lodash/merge');
const startCase = require('lodash/startCase');
const lower = require('lodash/toLower');
const bcrypt = require('bcrypt');
const getUser = require('../../../utils/getUser');
const parsePermissions =
  require('../../../utils/permissionArrayToObject');
const getPermission = require('../../../utils/getPermission');
const jsonify = require('../../../utils/searchToJson');

const populateUsers = async users => {
  let roles = {};
  let classes = {};
  let schools = {};

  for (let user of users) {
    if (user.role_id && !roles.hasOwnProperty(user.role_id)) {
      roles[user.role_id] = true;
    }

    if (user.class_id && !classes.hasOwnProperty(user.class_id)) {
      classes[user.class_id] = true;
    }

    if (user.school_id && !schools.hasOwnProperty(user.school_id)) {
      schools[user.role_id] = true;
    }
  }

  const roleKeys = Object.keys(roles);
  const classKeys = Object.keys(classes);
  const schoolKeys = Object.keys(schools);

  for (let role of roleKeys) {
    roles[role] = wonder.knex
      .select('*')
      .from('role')
      .where('id', parseInt(role, 10));
  }

  for (let classEntity of classKeys) {
    classes[classEntity] = wonder.knex
      .select('*')
      .from('class')
      .where('id', parseInt(classEntity, 10));
  }

  for (let school of schoolKeys) {
    schools[school] = wonder.knex
      .select('*')
      .from('school')
      .where('id', parseInt(school, 10));
  }

  const [rolesArray, classesArray, schoolsArray] = await Promise.all([
    Promise.all(
      roleKeys.map(key => roles[key])
    ),
    Promise.all(
      classKeys.map(key => classes[key])
    ),
    Promise.all(
      schoolKeys.map(key => schools[key])
    )
  ]);

  const newSchools = {};

  for (let role of rolesArray) {
    roles[role[0].id] = role[0];
  }

  for (let school of schoolsArray) {
    schools[school[0].id] = school[0];
  }

  for (let classEntity of classesArray) {
    classes[classEntity[0].id] = classEntity[0];

    if (
      !schools.hasOwnProperty(classEntity[0].school_id) &&
      !newSchools.hasOwnProperty(classEntity[0].school_id)
    ) {
      newSchools[classEntity[0].school_id] = wonder.knex
        .select('*')
        .from('school')
        .where('id', classEntity[0].school_id);
    }
  }

  const newSchoolsArray = await Promise.all(
    Object.keys(newSchools).map(key => newSchools[key])
  );

  for (let newSchool of newSchoolsArray) {
    schools[newSchool[0].id] = newSchool[0];
  }

  for (let user of users) {
    if (user.role_id) {
      user.role = roles[user.role_id];
    }

    if (user.class_id) {
      user.class = classes[user.class_id];

      if (user.class.school_id) {
        user.school = schools[user.class.school_id];
      }
    }

    if (user.school_id) {
      user.school = classes[user.school_id];
    }
  };
};

const approveAndManage = async (req, res, approve, count) => {
  const user = await getUser(req.cookies.jwt);
  const search = jsonify(req.search);
  const sortWays = [
    "first_name",
    "last_name",
    "id"
  ];

  if (user && user.approved) {
    const permissions =
      getPermission(
        user.permissions,
        ['user', approve ? 'approve' : 'manage']
      );
    let page, result, sortWay, i;

    if (!count) {
      page = parseInt(jsonify(req.search).page, 10) || 1;
    }

    for (i = 0; i < sortWays.length; i += 1) {
      if (search.sort_by === sortWays[i]) {
        sortWay = sortWays[i];
        break;
      }
    }

    if (i === sortWays.length) {
      sortWay = sortWays[0];
    }

    if (Array.isArray(permissions)) {
      result = (count ?
        wonder.knex
          .count('id') :
        wonder.knex
          .select(
            'id',
            'first_name',
            'last_name',
            'username',
            'class_id',
            'role_id',
            'school_id'
          )
      )
        .from('user');

      if (user.class_id) {
        result = result
          .where('approved', approve ? null : true)
          .andWhere('class_id', user.class_id)
          .andWhere(function () {
            this.whereIn('role_id', permissions);
          });
      } else if (user.school_id) {
        result = result
          .where('approved', approve ? null : true)
          .andWhere('school_id', user.school_id)
          .andWhere(function () {
            this.whereIn('role_id', permissions);
          });
      } else {
        result = result
          .where('approved', approve ? null : true)
          .andWhere('role_id', permissions);
      }
    } else if (permissions === true) {
      result = (count ?
        wonder.knex
          .count('*') :
        wonder.knex
          .select(
            'id',
            'first_name',
            'last_name',
            'username',
            'class_id',
            'role_id',
            'school_id'
          )
      )
        .from('user')
        .where('approved', approve ? null : true);
    } else {
      res.throw(403);
      return;
    }

    if (!approve) {
      result = result.andWhere('id', '!=', user.id);
    }

    if (count) {
      result = await result;
    } else {
      if (sortWay !== 'price') {
        result = await result
          .orderBy(sortWay)
          .limit(10)
          .offset((page - 1) * 10)
      }
    }

    if (count) {
      result = result[0][Object.keys(result[0])[0]];
    } else {
      if (!approve) {
        if (sortWay === 'price') {
          
        } else {
          await Promise.all(
            result.map(user => new Promise((resolve, reject) => {
              wonder.knex
                .sum('prize.price')
                .from('prize')
                .innerJoin('prize_user', 'prize_user.prize_id', 'prize.id')
                .where('prize_user.user_id', user.id)
                .then(sum => {
                  user.prizeSum = sum[0][Object.keys(sum[0])[0]] || 0;
                  resolve();
                });
            }))
          )
        }
      } else {
        await populateUsers(result);
      }
    }

    res.send(result);
    return;
  }

  res.throw(401);
  return;
}

module.exports = {
  signUp: async (req, res) => {
    let { firstName, lastName } = req.body;
    const {
      username,
      password,
      roleId,
      classId
    } = req.body;

    if (
      firstName &&
      lastName &&
      password &&
      username &&
      roleId &&
      classId &&
      password.length >= 8 &&
      !/[^0-9a-zA-Z#$*_]/.test(username) &&
      !/[^а-яА-ЯёЁ]/.test(firstName) &&
      !/[^а-яА-ЯёЁ]/.test(lastName)
    ) {
      firstName = startCase(lower(firstName));
      lastName = startCase(lower(lastName));

      const role = await wonder.knex
        .select('id')
        .from('role')
        .where('id', roleId);

      if (role[0]) {
        const classEntity = await wonder.knex
          .select('id')
          .from('class')
          .where('id', classId);

        if (classEntity[0]) {
          const potentiallyExistingUser = await wonder.knex
            .select('id')
            .from('user')
            .where('username', username);

          if (potentiallyExistingUser.length === 0) {
            const userId = await wonder.knex.transaction(trx => {
              const date = new Date();

              return bcrypt.hash(password, 10)
                .then(hash => (
                  trx.insert({
                    first_name: firstName,
                    last_name: lastName,
                    class_id: classId,
                    role_id: roleId,
                    password: hash,
                    username
                  })
                    .into('user')
                    .then(userId => userId[0])
                ));
            });

            const jwt = wonder.services.jwt.issue({
              id: userId
            });

            res.send({
              jwt,
              data: {
                isAuthenticated: true,
                first_name: 'Аноним',
                last_name: 'Анонимус',
                permissions: [],
                username
              }
            });

            return;
          }

          res.throw(403);

          return;
        }
      }
    }

    res.throw(400);

    return;
  },

  signIn: async (req, res) => {
    const { username, password } = req.body;

    if (
      password &&
      username &&
      password.length >= 8 &&
      !/[^0-9a-zA-Z#$*_]/.test(username)
    ) {
      const user = (await wonder.knex
        .select('*')
        .from('user')
        .where('username', username))[0];

      if (
        user &&
        await bcrypt.compare(password, String(user.password))
      ) {
        const jwt = wonder.services.jwt.issue({
          id: user.id
        });

        const permissions = user.role_id ?
          parsePermissions(
            await wonder.knex
              .select('permission.*')
              .from('permission')
              .innerJoin(
                'permission_role',
                'permission_role.permission_id',
                'permission.id'
              )
              .where('permission_role.role_id', user.role_id)
          ) :
          [];

        res.send({
          jwt,
          data: Object.assign({
            isAuthenticated: true,
            permissions,
          }, pick(user, [
            'first_name',
            'last_name',
            'username',
            'approved'
          ]))
        });

        return;
      }

      res.throw(401);

      return;
    }

    res.throw(400);

    return;
  },

  getApprovable: async (req, res) => {
    await approveAndManage(req, res, true, false);
  },

  countApprovable: async (req, res) => {
    await approveAndManage(req, res, true, true);
  },

  getManageable: async (req, res) => {
    await approveAndManage(req, res, false, false);
  },

  countManageable: async (req, res) => {
    await approveAndManage(req, res, false, true);
  },

  approve: async (req, res) => {
    const { approve, userId } = req.body;

    if (!(approve === undefined || userId === undefined)) {
      const user = await getUser(req.headers.authentication);

      if (user) {
        const approvedUser = (await wonder.knex
          .select('role_id')
          .from('user')
          .where('id', userId))[0];

        if (approvedUser) {
          const permission = getPermission(
            user.permissions,
            ['user', 'approve']
          );

          let role;

          if (Array.isArray(permission)) {
            for (role of permission) {
              if (role === approvedUser.role_id) {
                break;
              }
            }
          }

          if (role === approvedUser.role_id || permission) {
            await wonder.knex('user')
              .where('id', userId)
              .update('approved', Boolean(approve));

            res.send({});
            return;
          }

          res.throw(403);
          return;
        }

        res.throw(400);
        return;
      }

      res.throw(401);
      return;
    }

    res.throw(400);
    return;
  }
};
