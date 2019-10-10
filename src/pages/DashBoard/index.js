import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../service/api'
import socketio from "socket.io-client";


export default function DashBoard(){
    const [spots, setSpots] = useState([])
    const [requests, setRequest] = useState([])

    const user_id = localStorage.getItem('user')
    
    const socket = useMemo(() => socketio('http://localhost:3333',{
        query: { user_id }
    }),[user_id])

    useEffect(()=> {
        socket.on('booking_request', data =>{
            setRequest([...requests, data])
        })

    },[requests, socket])


    useEffect(() => {
        async function laodSpots(){
            const user_id = localStorage.getItem('user')

            const response = await api.get('/dashboard',{
                headers: { user_id }
            })

            setSpots(response.data)
        }

        laodSpots()
    }, [])

    ///bookings/:booking_id/approvals
    async function handleAceept(id){
        await api.post(`/bookings/${id}/approvals`)

        setRequest(requests.filter(requests => requests._id !== id))
    }

    ///bookings/:booking_id/rejections
    async function handleReject(id){
        await api.post(`/bookings/${id}/rejections`)

        setRequest(requests.filter(requests => requests._id !== id))
    }

    return (
        <>
            <ul className="notifications">
                {requests.map(request => (
                    <li key={request._id}>
                        <p>
                            <strong>{request.user.email}</strong> esta solicitando uma reserva em <strong>{request.spot.company}</strong> para data <strong>{request.date}</strong>
                        </p>

                        <button className="aceept" onClick={() => handleAceept(request._id)} >ACEITAR</button>
                        <button className="reject" onClick={() => handleReject(request._id)}>REJEITAR</button>
                    </li>
                ))}
            </ul>


            <ul className="spot-list">
                {spots.map(spot => (
                    <li key={spot._id}>
                        <header style={{ backgroundImage: `url(${spot.thumbnail_url})`, backgroundRepeat: 'no-repeat' }} />  
                        <strong>{spot.company}</strong>
                        <span>{spot.price ? `R$ ${spot.price}/dia`: 'GRATUITO'}</span>
                    </li>   
                ))}
            </ul>

            <Link to="/new">
                <button className="btn">Cadastrar novo spot</button>
            </Link>
        </>
    )
}