import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Table from './Components/Table'

import * as config from '../config/table_properties.json'
import '../css/custom-bootstrap.scss'
import ErrorBoundary from './HOC/ErrorBoundary'

const AppController = () => {  
  return (
    <ErrorBoundary>
      <Container>
        <Row>
          <Col xs={12}>
              <Table
                id="dynamicTable"
                apiLookupId = "id"
                apiEndpoint = { process.env.REACT_APP_BOOKS_API_URL }
                apiCacheSize = { 1*process.env.REACT_APP_CASHE_PERCENT || 0 }
                itemsPerPage = { 1*process.env.REACT_APP_ITEMS_PER_PAGE || 20 }
                apiLookup = "books"    
                apiLookupCount = "count"                            
                columns = { config.columns } 
                startPage = { 1*window.location.hash.replace('#','') || 1 }
                paginated = { true }          
                sizePerPageList = { config.select_options }
                enableKbdShortcuts = { true }
                onPageChange = { (page) => { window.location.hash = page } }          
              />
          </Col>
        </Row>
      </Container>
    </ErrorBoundary>
  );
};

export default AppController;
