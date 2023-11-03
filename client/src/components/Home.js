import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import AuthContext from "../context/AuthProvider";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";  

const Home = () => {
    const { setAuth } = useContext(AuthContext);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const SCAN_URL = "/scanItems"
    const SCANNED_ITEMS_URL = "/scannedItems"
    const logout = async () => {
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        setAuth({});
        navigate('/linkpage');
    }
   const [productData, setProductData] = useState([]);
   const [expandedRows, setExpandedRows] = useState(null);

   const scanItem = async () => {const response = await fetch(SCAN_URL, {
                 method: 'POST',
                 headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                          },
		body: JSON.stringify(auth),
                });
		console.log(response.body);
	}

  async function getScannedItems(){const response = await fetch(SCANNED_ITEMS_URL, {
                 method: 'POST',
                 headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                          },
                body: JSON.stringify(auth),
                });
        	const responseJson = await response.json();
		setProductData(responseJson.productArray);
		console.log(responseJson);
		}

	useEffect(() => {
        	getScannedItems();
   	 }, [])

	const imageBodyTemplate = (rowData) => {
        	return <img src={`images/product/${rowData.image}`} alt={rowData.image} className="product-image" />;
    	}
	const searchBodyTemplate = () => {
        	return <Button icon="pi pi-search" />;
    	}	

	 const rowExpansionTemplate = (data) => {
        return (
            <div className="orders-subtable">
                <h5>Scanned Products</h5>
                <DataTable value={data.orders}>
                    <Column field="name" header="Product name" sortable></Column>
                    <Column body={imageBodyTemplate} header="Product image" ></Column>
                    <Column field="price" header="Price" sortable></Column>
                    <Column field="grammage" header="Grammage" ></Column>
                    <Column field="brand" header="Brand" sortable></Column>
                    <Column headerStyle={{ width: '4rem'}} body={searchBodyTemplate}></Column>
                </DataTable>
            </div>
        );
    }		

    return (
        <section>
	    <p> scanned Items </p>
            <br />
            <DataTable value={productData} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
             	dataKey="id"  tableStyle={{ minWidth: '60rem' }} rowExpansionTemplate={rowExpansionTemplate} >
    		<Column expander style={{ width: '5rem' }} />
		<Column field="user" header="User" sortable />
    	   </DataTable>
            <div className="flexGrow">
                <button onClick={logout}>Sign Out</button>
		<button onClick={scanItem}>Scan Item</button>
            </div>

        </section>
    )
}

export default Home
