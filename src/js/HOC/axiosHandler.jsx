import React, {useEffect} from "react";
import axios from "axios";

const checkRequests = Wrapped => {
    function CheckRequests(props) {
        useEffect(()=>{
            axios.interceptors.response.use(function (response) {                
                return response;
            }, function (error) {                
                return Promise.reject(error);
            });
        })
        return (
            <Wrapped {...props} />
        )
    }
    return CheckRequests
}

export default checkRequests