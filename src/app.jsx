import React, { Suspense, lazy } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { Button } from 'antd'
// import Home from './pages/home/index.jsx'
// import About from './pages/about/index.jsx'

const Home = lazy(() => import( /* webpackChunkName:'home' */ './pages/home'))
const About = lazy(() => import( /* webpackChunkName:'about' */ './pages/about'))


function App () {
  return (
    <div>
      <h1>App</h1>
      <Button type='primary'>按钮</Button>
      <ul>
        <li> <Link to='/home'>Home</Link> </li>
        <li> <Link to='/about'>About</Link> </li>
      </ul>

      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/about' element={<About />}></Route>
        </Routes>
      </Suspense>

    </div>
  )
}
export default App 