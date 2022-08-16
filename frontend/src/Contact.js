import { React, useEffect, useRef } from 'react';
import './App.css';
import jpg1 from './Images/Contact1.jpg';
import jpg2 from './Images/Contact2.jpg';
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
    <div >
        <div className="btns">
            <a href="/" className="fill" style= { { marginLeft: '80px' }} id={'contact_home_button'}>Home</a>
            <a href="/About" className="fill" style= { { marginLeft: '80px' }} id={'contact_about_button'}>About</a>
            <b href="" id={'contact_contact_button'}><u>Contact</u></b>
            <a className="fill" href="/Login" style={ { marginLeft: '80px' } } id={'contact_login_button'} >Log In</a>
        </div>
        <img ref={img1} src={jpg1} alt="img" id={'contact_img1'}/>
        <span>
        <b className="btn523 we">We’re here to help</b>
        <c variant="h4" className="btn52 if">If you have any questions or comments, please contact us via email or <br/>phone.</c>
        <b className="btn52 number">Email<br/>
          support@homemate.com.au
        <br/><br/> Phone <br/>+61(406)573-646</b>
        <img ref={img2} src={jpg2} alt="img" id={'contact_img1'}/>
        <img ref={img3} src={jpg3} alt="img" id={'contact_img1'}/>
        </span>
    </div>
  );
}

export default App;
