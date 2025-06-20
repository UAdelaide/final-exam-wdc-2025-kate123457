exports.guard = (role) => (req,res,next)=>{
  if(!req.session.user) return res.status(401).end();
  if(role && req.session.user.role!==role) return res.status(403).end();
  next();
};
