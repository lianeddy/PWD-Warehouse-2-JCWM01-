import React from 'react';
import ProductCard from '../components/ProductCard'
import Axios from 'axios'
import {API_URL} from '../constants/API'
import "../assets/styles/admin.css"
import { connect } from 'react-redux'

class Admin extends React.Component {
  state = {
    menu:"add",
    productList:[],
    page: 1,
    maxPage:0,
    itemPerPage:10,
    adminData:[],
    selectedWarehouse:1,
    warehouseList:[],
    
    edit_id:0,
    edit_product_id:0,
    editName:"",
    editPrice:0,
    editCategory:"",
    editColor:"",
    editImageURL:"",

    edit_stock_id:0,
    editStock:0,
  }

  fetchAdminData = () => {
    Axios.get(`${API_URL}/admin/data?user_id=${this.props.userGlobal.user_id}`)
    .then((result) => {
      this.setState({adminData: result.data[0]})
      this.selectWarehouse()
    
    })
    .catch((err)=>{
      alert(err)
  })
  }

  selectWarehouse = () => {
    if(this.state.adminData.auth_status==="admin"){
      
      this.setState({selectedWarehouse:this.state.adminData.warehouse_id})
      this.fetchAdminProduct()
    }
  }

  fetchAdminProduct = () => {
    Axios.get(`${API_URL}/admin/product-list?page=${this.state.page-1}&product_name=${this.props.userGlobal.searchProduct}&warehouse_id=${this.state.selectedWarehouse}`)
    .then((result) => {
      this.setState({productList: result.data}, this.fetchMaxPage())
      // console.log(this.state.productList)
    })
    .catch((err)=>{
      alert(err)
    })
  }

  fetchMaxPage = () => {
    Axios.get(`${API_URL}/admin/product-max-page?product_name=${this.props.userGlobal.searchProduct}&warehouse_id=${this.state.selectedWarehouse}`)
    .then((result) => {
      this.setState({maxPage: Math.ceil((result.data[0].sumProduct)/this.state.itemPerPage)})
    })
    .catch((err)=>{
      alert(err)
  })
  }
 
  inputHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    
    this.setState({[name] : value})
  }

  nextPageHandler = () => {
    this.setState({page: this.state.page + 1}, this.fetchAdminProduct)
  }

  prevPageHandler = () => {
    this.setState({page: this.state.page - 1}, this.fetchAdminProduct)
  }

  fetchWarehouseList = () => {
    Axios.get(`${API_URL}/admin/warehouse`)
    .then((result) => {
      this.setState({warehouseList:result.data})
    })
    .catch((err)=>{
      alert(err)
  })
  }

  renderWarehouse = () => {
    return this.state.warehouseList.map((val)=> {
      if(val.warehouse_name!=="superadmin"){
        return <option value={val.warehouse_id}>{val.warehouse_name}</option>
      }
    })
  }

  warehouseHandler = (event) => {
    const value = event.target.value;

    this.setState({selectedWarehouse : value},this.fetchAdminProduct)
    this.setState({page : 1})

  }

  editProducts = (val) =>{
    this.setState({edit_id:val.warehouse_stock_id})
    this.setState({edit_product_id:val.product_id})
  }

  editStock = (warehouse_stock_id) =>{
    this.setState({edit_stock_id:warehouse_stock_id})
  }

  cancelProducts = () =>{
    this.setState({edit_id:0})
    this.setState({edit_stock_id:0})
  }

  saveProducts = () =>{
    const confirmEdit = window.confirm("If you save your changes on this product, it would change the entire product data on other sizes and warehouses. Continue?")
    if(confirmEdit) {
      Axios.patch(`${API_URL}/admin/edit-product?product_id=${this.state.edit_product_id}&page=${this.state.page-1}&warehouse_id=${this.state.selectedWarehouse}`,{
        product_name: this.state.editName,
        price_sell: this.state.editPrice,
        category: this.state.editCategory,
        color: this.state.editColor,
        product_image:  this.state.editImageURL
      })
      .then((result) => {
        console.log(result.data)
        this.fetchAdminProduct()
        this.setState({edit_id:0})
        this.setState({edit_product_id:0})
      })
      .catch((err)=>{
        console.log(err)
      })
    } 
  }

  saveStock = () =>{
    const confirmEdit = window.confirm("Continue change stock quantity?")
    if(confirmEdit) {
      Axios.patch(`${API_URL}/admin/edit-stock?warehouse_stock_id=${this.state.edit_stock_id}&page=${this.state.page-1}&warehouse_id=${this.state.selectedWarehouse}`,{
        warehouse_stock:this.state.editStock,
        user_stock:this.state.editStock,
      })
      .then((result) => {
        console.log(result.data)
        this.fetchAdminProduct()
        this.setState({edit_stock_id:0})
      })
      .catch((err)=>{
        console.log(err)
      })
    } 
  }

  renderProducts = ()=>{
    return this.state.productList.map((val) =>{
      if(val.warehouse_stock_id===this.state.edit_id){
        return(
          <tr>
            <td>
              <input className="input-admin" type="text" value={this.state.editName} placeholder={val.product_name} onChange={this.inputHandler} name="editName" />
            </td>
            <td>Rp. {val.price_buy.toLocaleString()}</td>
            <td>
              <input className="input-admin" type="number" value={this.state.editPrice} placeholder={val.price_sell} onChange={this.inputHandler} name="editPrice" />
            </td>
            <td>
              <input className="input-admin" type="text" value={this.state.editCategory} placeholder={val.category} onChange={this.inputHandler} name="editCategory" />
            </td>
            <td>
              <input className="input-admin" type="text" value={this.state.editColor} placeholder={val.color} onChange={this.inputHandler} name="editColor" />
            </td>
            <td>
              <input className="input-admin" type="text" value={this.state.editImageURL} placeholder="Image URL" onChange={this.inputHandler} name="editImageURL" />
            </td>
            <td>{val.size.toUpperCase()}</td>
            <td>{val.available_stock}</td>
            <td colSpan="2">
              <button className="btn btn-save" onClick={this.saveProducts}>Save Product</button>
            </td>
            <td>
              <button className="btn btn-cancel" onClick={this.cancelProducts}>Cancel</button>
            </td>
          </tr>
        )
      }
      if(val.warehouse_stock_id===this.state.edit_stock_id){
        return(
          <tr>
            <td>{val.product_name}</td>
            <td>Rp. {val.price_buy.toLocaleString()}</td>
            <td>Rp. {val.price_sell.toLocaleString()}</td>
            <td>{val.category}</td>
            <td>{val.color}</td>
            <td><img src={val.product_image} className="admin-product-image" alt={val.productName}/></td>
            <td>{val.size.toUpperCase()}</td>
            <td>
              <input className="input-admin" type="text" value={this.state.editStock} placeholder={val.available_stock} onChange={this.inputHandler} name="editStock" />
            </td>
            <td colSpan="2">
              <button className="btn btn-save" onClick={this.saveStock} >Save Stock</button>
            </td>
            <td>
              <button className="btn btn-cancel" onClick={this.cancelProducts}>Cancel</button>
            </td>
          </tr>
        )
      }
      else{
        return(
          <tr>
            <td>{val.product_name}</td>
            <td>Rp. {val.price_buy.toLocaleString()}</td>
            <td>Rp. {val.price_sell.toLocaleString()}</td>
            <td>{val.category}</td>
            <td>{val.color}</td>
            <td><img src={val.product_image} className="admin-product-image" alt={val.productName}/></td>
            <td>{val.size.toUpperCase()}</td>
            <td>{val.available_stock}</td>
            <td>
              <button className="btn btn-edit" onClick={()=>this.editProducts(val)}>Edit Product</button>
            </td>
            <td>
              <button className="btn btn-edit" onClick={()=>this.editStock(val.warehouse_stock_id)}>Edit Stock</button>
            </td>
            <td>
              <button className="btn btn-delete" >Delete</button>
            </td>
          </tr>
        )
      }

      
    })
  }

  componentDidMount = () => {
    if(this.props.userGlobal.auth_status==="superadmin"){
      this.fetchAdminProduct()
    }
    this.fetchAdminData()
    this.fetchWarehouseList()
  }

  render(){
    return(
        <div className="admin-page">
          <h2>Hello, {this.props.userGlobal.username}!</h2>

          {
            this.props.userGlobal.auth_status==="superadmin"?
            <>
              <h3>You are a {this.props.userGlobal.auth_status}.</h3>
              <div className="mt-3 col-4 d-flex flex-row justify-content-start align-items-center">
                <p className="me-2" >Please select a warehouse</p>
                <select onChange={this.warehouseHandler} name="selectedWarehouse" className="form-control filter-style">
                  {this.renderWarehouse()}
                </select>
              </div>

            </>
            :
            <h3>You are an {this.props.userGlobal.auth_status} of warehouse: {this.state.adminData.warehouse_name}.</h3>
          }
          

          <div className="col-10 mt-3">
            <div className="d-flex flex-row justify-content-start">
              <button className="btn-admin" name="menu" onClick={this.inputHandler} value="add">Add Product</button>
              <button className="btn-admin" name="menu" onClick={this.inputHandler} value="products">Products List</button>
              <button className="btn-admin" name="menu" onClick={this.inputHandler} value="history">Transaction History</button>
              <button className="btn-admin" name="menu" onClick={this.inputHandler} value="requests">Stock Requests</button>
              <button className="btn-admin" name="menu" onClick={this.inputHandler} value="revenue">Warehouse Revenue</button>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              {
                this.state.menu==="add"?
                <h1>ADD PRODUCT</h1>
                :
                this.state.menu==="products"?
                <>
                  <div className="col-12">
                    <table className="table">
                      <thead className="table-light">
                        <tr>
                          <th>Product Name</th>
                          <th>Buying Price</th>
                          <th>Selling Price</th>
                          <th>Category</th>
                          <th>Color</th>
                          <th>Image</th>
                          <th>Size</th>
                          <th>Stock</th>
                          <th colSpan="3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.renderProducts()}
                      </tbody>
                      <tfoot >
                          
                      </tfoot>
                    </table>
                    <div className="d-flex flex-row justify-content-between align-items-center">
                      <button className="btn-admin" disabled={this.state.page===1} onClick={this.prevPageHandler}>Previous Page</button>
                      <p>Page {this.state.page} of {this.state.maxPage}</p>
                      <button className="btn-admin" disabled={this.state.page===this.state.maxPage} onClick={this.nextPageHandler}>Next Page</button>
                    </div>
                  </div>
                </>
                :
                this.state.menu==="history"?
                <h2>HISTORY TABLE</h2>
                :
                this.state.menu==="requests"?
                <h2>STOCK REQUESTS TABLE</h2>
                :
                this.state.menu==="revenue"?
                <h2>WAREHOUSE REVENUE TABLE</h2>
                :
                null
              }
            </div>
          </div>
        </div>
    )
  }
}

const mapStateToProps =(state)=> {
  return{
    userGlobal: state.user,
  }
  };

  export default connect(mapStateToProps)(Admin);