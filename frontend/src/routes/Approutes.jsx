import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from '../components/common/Signup'
import Login from '../components/common/Login'
import UpdatePassword from '../components/user/ResetPassword'
import Home from '../components/dashboard/Home'


const Approutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/login" replace />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route path='/home' element={<Home />} />
      <Route path="/reset-password/:token" element={<UpdatePassword />} />

      {/* 404 Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default Approutes
