import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from '../components/common/Signup'

const Approutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Navigate to="/signup" replace/>} />
        <Route path='/signup' element={<Signup/>} />
      
    </Routes>
  )
}

export default Approutes
