const router = require('express').Router();
const db     = require('../models/db');        //

// POST /api/login
router.post('/login', async (req,res)=>{
  const {username,password} = req.body;
  const [rows] = await db.execute(
    'SELECT user_id, password_hash, role FROM Users WHERE username=?',
    [username]
  );
  if(!rows.length || rows[0].password_hash!==password)
    return res.status(401).json({msg:'Bad credentials'});

  req.session.user = { id: rows[0].user_id, role: rows[0].role, name: username };
  res.json({ role: rows[0].role });
});

// GET /api/me
router.get('/me',(req,res)=>{
  if(!req.session.user) return res.status(401).end();
  res.json(req.session.user);
});

// POST /api/logout
router.post('/logout',(req,res)=> req.session.destroy(()=>res.json({ok:true})) );

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});


module.exports = router;
