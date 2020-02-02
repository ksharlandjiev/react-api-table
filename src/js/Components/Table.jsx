import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Spinner } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import http from 'axios';
import axiosHandler from '../HOC/axiosHandler'


class Table extends Component {
  constructor(props) {
    super(props);
    this.fetchApiData = this.fetchApiData.bind(this);
    this.pageChange = this.pageChange.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
    this.getPageItems = this.getPageItems.bind(this)
    
    this.state = { 
      items: {},
      total: 0,
      currentPage: props.startPage || 1,
      itemsPerPage: props.itemsPerPage      
    }

    //helper that give us keyboard shortcuts for moving trough pages.
    this.kbdShortcuts = this.kbdShortcuts.bind(this);
  }

  componentDidMount() {
    // fetch initial data from remote API.
    this.pageChange(this.state.currentPage, this.state.itemsPerPage, []);
    
    //setup event Listener if Keyboard shortcuts are enabled
    this.props.enableKbdShortcuts && document.addEventListener("keydown", this.kbdShortcuts, false);
  }

  componentWillUnmount(){    
    this.props.enableKbdShortcuts && document.removeEventListener("keydown", this.kbdShortcuts, false);
  }
  
  /** Changes the items per page and fetching the new number of elements per page */
  changePageSize = (page, size) => {
    this.setState({ itemsPerPage: size}, () => this.pageChange(page, size));    
  }

  /**
   * Display the correct number of items per page from cache.
   */
  getPageItems = (page) => {  
    if (this.state.items && this.state.items[page-1]) {
      return this.state.items[page-1];
    }
    return [];
  }


  /**
   * Calculate if we need to trigger new API call to fetch more data.
   * General rule of thumb up is to trigger a remote API call when we have 
   * ( cacheSize / 2 ) items left.
   */
  pageChange = (page, sizePerPage, filter = null) => {        
    this.setState({
      currentPage: page
    });

    // call parent funciton if such is hooked in;
    // Currently used to set a a hash with the page number.
    this.props.onPageChange && this.props.onPageChange(page, sizePerPage);

    const cashedItems = this.getPageItems(page);
    if (cashedItems && cashedItems.length === sizePerPage) {
      return cashedItems;
    }
    return this.fetchApiData(page, sizePerPage, filter);
  }
  
  /**
   * Calculate what would be the API fetch size.
   * In case we don't have cache, we take the items per page.
   */
  calculateCacheSize = () => {
    return ( ( this.props.apiCacheSize / 100 * this.state.itemsPerPage) * this.state.itemsPerPage )  || this.state.itemsPerPage ;
  }

   /** 
   * Function to communicate with remote api
   * @param integer page            Page number to fetch
   * @param integer sizePerPage     Items per page.
   * @param string  filter          Search keyword  
   * 
   * @returns object items          The items for specific page.
   */
  fetchApiData = (page, sizePerPage, filter = null) => {

    let stateItems = {...this.state.items};

    this.setState({ loading: true }, () => {
      let filters = []

      http.post(
        this.props.apiEndpoint, 
        {
          page: page,
          itemsPerPage: Math.round( sizePerPage + (page < 40 ? this.calculateCacheSize() : 0)),
          filters: filters
        })
        .then((result) => {
          let books = result.data[this.props.apiLookup] || [];             
          
          if (stateItems[(page-1)] && books.length === sizePerPage) {            
            stateItems[(page-1)] = books;
          } else {         
            // Chunk the data and save under page number.
            const paginatedItems = books.reduce(( stateItems, item, index) => { 
              const chunkIndex = ((page-1)) + Math.floor(index / sizePerPage);
              if(!stateItems[chunkIndex]) {
                stateItems[chunkIndex] = [] // start a new chunk
              }
            
              stateItems[chunkIndex].push(item)
            
              return stateItems
            }, [])            

            stateItems = {
              ...stateItems,
              ...paginatedItems
            }
          }
            
          this.setState({
            loading: false,
            items: stateItems,
            total: result.data[this.props.apiLookupCount] || 0,
          });
        })
        .catch (error => { throw new Error("Error fetching from remote host:", error) } );
    });

    return stateItems[page];
  }  

  render() {    
    const {id, apiLookupId, apiEndpoint, apiLookup, apiLookupCount, apiCacheSize, itemsPerPage, startPage, paginated, ...allProps} = this.props;

      if ( this.state.loading || !this.state.items ) { 
        return ( 
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner> 
        )
      } 
      
      let pagination = false;
      if ( paginated ) {
        pagination = paginationFactory( {
          page: this.state.currentPage,
          active: true,
          sizePerPage: this.state.itemsPerPage,
          totalSize: this.state.total,
          sizePerPageList: this.props.sizePerPageList || null,            
          onPageChange: (page, sizePerPage) => this.pageChange(page, sizePerPage),
          onSizePerPageChange: (sizePerPage, page) => this.changePageSize(page, sizePerPage),                         
        })
      }

      return (
        <BootstrapTable 
          id = { id }
          keyField={ apiLookupId }
          data={ this.getPageItems(this.state.currentPage) } 
          columns={ this.props.columns }
          pagination={ pagination } 
          remote={ {
            filter: false,
            pagination: true,
            sort: false,
            cellEdit: false
          } }          
          onTableChange = { () => {} }
          { ...allProps }
        /> 
      );
  }

    /**
   * Simple keyboard event listener.
   * Currently supports just arrow left and right
   * which triggers next/prev page.   
   */
  kbdShortcuts(event) {
    switch (event.keyCode) {
      case 37: 
        this.state.currentPage>1 && this.pageChange( this.state.currentPage - 1, this.state.itemsPerPage );
        break;
      case 39: 
        this.state.currentPage< ( this.state.total / this.state.itemsPerPage) && this.pageChange( this.state.currentPage + 1, this.state.itemsPerPage );
        break;
      default:
        //do nothing
    }    
  }
}

Table.propTypes = {
  id: propTypes.string.isRequired,  
  apiEndpoint: propTypes.string.isRequired,
  apiLookup: propTypes.string.isRequired,    
  apiLookupId: propTypes.string.isRequired,
  apiLookupCount: propTypes.string.isRequired,
  apiCacheSize: propTypes.number.isRequired,
  itemsPerPage: propTypes.number.isRequired,
  columns: propTypes.array.isRequired,
  startPage: propTypes.number,
  paginated: propTypes.bool,
  sizePerPageList: propTypes.array,
  onPageChange: propTypes.func,
  onSizePerPageChange: propTypes.func,
  onTableChange: propTypes.func, 
  enableKbdShortcuts: propTypes.bool
};


export default axiosHandler(Table);