import "./App.css"
import { BrowserRouter,Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"

import Register from "./pages/Register";


import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Admindashboard from "./pages/Admindashboard";
import Addproduct from "./pages/Addproduct";
import Viewproduct from "./pages/Viewproduct";
import Manageproduct from "./pages/Manageproduct";
import Editproduct from "./pages/Editproduct";
import Manageusers from "./pages/Manageusers";
import Manageservice from "./pages/Manageservice";
import Uploadproductform from "./pages/Uploadproductform";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Product from "./pages/Product";
import Order from "./pages/Order";
import OrderTrack from "./pages/OrderTrack"


import Home from "./pages/Dashboard";
import CategoryProducts from "./pages/CategoryProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      
      <Route path="/admindashboard" element={<Admindashboard />} />
      <Route path="/addproduct" element={<Addproduct />} />
      <Route path="/viewproduct" element={<Viewproduct />} />
      <Route path="/manageproduct" element={<Manageproduct />} />
      <Route path="/editproduct/:id" element={<Editproduct />} />
      <Route path="/manageusers" element={<Manageusers />} />
      <Route path="/manageservice" element={<Manageservice />} />
      <Route path="/uploadproductform" element={<Uploadproductform />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/category" element={<CategoryProducts />} />
      <Route path="/product" element={<Product />} />
      <Route path="/order" element={<Order />} />
      <Route path="/OrderTrack" element={<OrderTrack />} />
      
      

      
      </Routes>
    </BrowserRouter>
  )
}

export default App;