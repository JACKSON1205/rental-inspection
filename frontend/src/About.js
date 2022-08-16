import { React, useEffect, useRef } from 'react';
import './App.css';
import jpg1 from './Images/about1.jpg';
import jpg2 from './Images/about2.jpg';
import jpg3 from './Images/ac3.jpg';

function App () {
  const [img1, img2, img3] = [useRef(), useRef(), useRef()];
  useEffect(() => {
    const imgs = [img1, img2, img3];
    const ob = new IntersectionObserver(
      entries => {
        entries.forEach(item => {
          const { intersectionRatio, target } = item
          target.setAttribute('style', `opacity:${intersectionRatio * 2}`)
        })
      },
      {
        threshold: new Array(100).fill(null).map((_, index) => index / 100),
      }
    )
    imgs.forEach(item => {
      ob.observe(item.current)
    })
  }, [])
  return (
    <div>
        <div className="btns">
            <a href="/" className="fill" id={'about_home_button'}>Home</a>
            <b href="/About" id={'about_about_button'} ><u>About</u></b>
            <a href="/Contact" className="fill" id={'about_home_button'}>Contact</a>
            <a className="fill" href="/Login" id={'about_login_button'}>Log In</a>
        </div>
        <img ref={img1} src={jpg1} id={'about_img1'} alt="img"/>
        <b className="btn523 how">How our journey began</b>
        <c variant="h5" className="btn52 home">Homemate started as a university project, by a small team of students who saw an<br/>opportunity to make home inspections easy, simple, paperless, and convenient.<br/>We at BigAi,hope to keep bringing the best experiences for our customers.
        </c>
        <a className="btn40 what">What People Are Saying</a>
        <c className="btn42 before">“Before homemate, I was overwhelmed by all the<br/>paperwork. Now everything is in one place!”</c>
        <c variant="h4" className="btn42 alexa">-ALEXA V.</c>
        <c variant="h4" className="btn42 el">“I can talk to my manager whenever I like, <br/>straight from the app!”</c>
        <c variant="h4" className="btn42 eli">-ELIZABETH B.</c>
        <c variant="h4" className="btn42 my">“Without homemate, I would never be able to <br/> easily schedule all of my inspections!”</c>
        <c variant="h4" className="btn42 sa">-SARAH P.</c>
        <c variant="h4" className="btn42 let">“Homemate lets met easily list my properties and see <br/>which are on the market.”</c>
        <c variant="h4" className="btn42 vic">-VICTORIA G.</c>
        <img ref={img2} src={jpg2} id={'about_img1'} alt="img"/>
        <img ref={img3} src={jpg3} id={'about_img1'} alt="img"/>
    </div>
  );
}

export default App;
