const express  = require('express');
const session  = require('express-session');
const path     = require('path');
require('dotenv').config();

const app = express();

/* ---------- 基础中间件 ---------- */
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dog_walk_secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static(path.join(__dirname,'public')));

/* ---------- 路由 ---------- */
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { guard } = require('./routes/authHelper');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api',       authRoutes);        // /login /logout /me

/* 受保护的静态页面 */
app.get('/owner-dashboard.html',  guard('owner'),
  (req,res)=>res.sendFile(path.join(__dirname,'public/owner-dashboard.html')));
app.get('/walker-dashboard.html', guard('walker'),
  (req,res)=>res.sendFile(path.join(__dirname,'public/walker-dashboard.html')));

module.exports = app;   // bin/www 会调用
