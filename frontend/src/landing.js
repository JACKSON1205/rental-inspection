import { React, useEffect, useRef, useState } from 'react';
import './App.css';
import jpg1 from './Images/1.jpg';
import jpg2 from './Images/2.jpg';
import jpg3 from './Images/3.jpg';
import Typography from '@material-ui/core/Typography';

const [ratio1, ratio2, ratio3] = [14224 / 6909, 14224 / 6909, 14224 / 6909];

function App () {
  const root = useRef()
  const imgs = [useRef(), useRef(), useRef()];
  const [img1, img2, img3] = imgs
  const ops = [useState(1), useState(1), useState(1)]
  const [[op1], [op2], [op3]] = ops;
  const heights = [useState('130vh'), useState('100vh'), useState('100vh')]
  const [[h1], [h2], [h3]] = heights;
  useEffect(() => {
    const ob = new IntersectionObserver(
      entries => {
        entries.forEach((item, index) => {
          ops[index][1](item.intersectionRatio * 2)
        })
      },
      {
        threshold: new Array(100).fill(null).map((_, index) => index / 100),
        root: root.current,
      }
    )
    imgs.forEach(item => {
      ob.observe(item.current)
    })
    window.addEventListener('resize', () => {
      const _width = document.documentElement.clientWidth;
      const hs = [ratio1, ratio2, ratio3].map(a => _width / a)
      imgs.forEach((_, index) => {
        heights[index][1](hs[index])
      })
    })
  }, [])
  return (
    <div ref={root}>
        <div className="btns">
            <a href="/About" id={'about_home_button'}>About</a>
            <a href="/Contact" id={'about_home_button'}>Contact</a>
            <a href="/Login" className="fill" style= { { marginLeft: '80px' } } id={'landing_login_button'} >Log In</a>
        </div>
        <img ref= { img1 } src= { jpg1 } alt="img" style= { { opacity: op1, height: h1 } } />
        <div className="ctn2">
          <img ref= { img2 } src= { jpg2 } alt="img" style= { { opacity: op2, height: h2 } } />
          <b className="btn4 list">List your properties <br/> and leave it to us.</b>
          <b className="btn4 forget">Forget paperwork</b>
          <b className="btn4 tenant">Perform self<br/>inspections easily</b>
          <b className="btn4 find">Find your happiness<br/>and learn to put it first</b>
          <c className="btn41 tenant2">Request maintenance, receive reports, and perform self inspections from the<br/>comfort of your home</c>
          <c className="btn41 mgr">Keep all your documents and reports in one place, choose from many<br/>available templates,and customize your own for extra convenience</c>
          <c className="btn41 owner">Connect with your property manager, list your properties, and be notified of<br/>news and updates</c>
          <a href="/auth/register" className="btn tenant">Join as Tenant</a>
          <a href="/auth/register" className="btn manager">Join as Manager</a>
          <a href="/auth/register" className="btn owner">Join as Owner</a>
        </div>
        <div className="ctn3">
          <b className="btn5 before">“Before Homemate, I was overwhelmed by all</b>
          <b className="btn5 the">the paperwork. Now everything is in one</b>
          <b className="btn5 p">place!”</b>
          <Typography className="btn5 a">-Alexa V.</Typography>
          <img ref= { img3 } src= { jpg3 } alt="img" style= { { opacity: op3, height: h3 } } />
          <a href="/About" className="btn3 about"><u>About</u></a>
          <a href="/auth/register" className="btn3 start"><u>Get Started</u></a>
        </div>
    </div>
  );
}

export default App;
