import React, { useMemo, useContext, createContext, state, useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';

import LoginLayout from "../Containers/LoginLayout";
import logo from '../static/img/logobig.jpeg'
import profile from '../static/css/profile.css'
import checkboxStyle from '../static/css/checkboxStyle.css'
import { Users, Lock, Hash, DollarSign, ToggleLeft, Sun, Map, MapPin, Globe, Briefcase, Clipboard, Mail, Phone, Smartphone, AlertCircle, Check, User, Calendar, Trello } from 'react-feather';

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { parseISO } from 'date-fns'

import {
	LoadingOutlined, 
	UserOutlined,
	MailOutlined,
	LockOutlined,
	UnlockOutlined,
	CameraOutlined,
	SettingOutlined,
	UserSwitchOutlined,
	ProfileOutlined,
	EyeOutlined,
  } from '@ant-design/icons';

import { Spin } from 'antd';
import { Space } from 'antd';


import Cookies from 'universal-cookie';
const cookies = new Cookies(); 

import moment from 'moment';

let appdomain 	= "https://niovarpaie.ca"; // app domain
let lbdomain 	= "https://loadbalancer.niovarpaie.ca"; // load balancer domain
let compagnie 	=  cookies.get( "compagnie" );
let appfichierUrl   = "https://fichiers.niovarpaie.ca";
let nopicPhotoUrl	= "https://fichiers.niovarpaie.ca/uploads/file-1661999118517.jpg";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import fr from 'date-fns/locale/fr';
registerLocale('fr', fr)

// Helper: get parametter from url
function getUrlParametter( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}


// Example: getUrlParametter('q', 'hxxp://example.com/?q=abc')
const days = [
	{
		id: 0,
		name: "Dimanche"
	},
	{
		id: 1,
		name: "Lundi"
	},
	{
		id: 2,
		name: "Mardi"
	},
	{
		id: 3,
		name: "Mercredi"
	},
	{
		id: 4,
		name: "Jeudi"
	},
	{
		id: 5,
		name: "Vendredi"
	},
	{
		id: 6,
		name: "Samedi"
	}
];

const SexeList= [
	{
		id: 0,
		name: "Homme"
	},
	{
		id: 1,
		name: "Femme"
	},
];

const RoleList = [
	{
		id: 0,
		name: "Employer"
	},
	{
		id: 1,
		name: "Repartiteur"
	},
	{
		id: 2,
		name: "Gestionnaire"
	},
	{
		id: 3,
		name: "Administrateur"
	}
]
	

// Todo: set a backend
const SalaireTypeList = [
	{
		id: 0,
		name: "Salaire horaire"
	},
	{
		id: 1,
		name: "Salaire annuel"
	},
];

// Calculate salary type for employee's input value
function getSalaryTypeName( SalaireTypeId ){
	for( var i = 0; i < SalaireTypeList.length; i++ ){
		let id = SalaireTypeList[ i ].id;
		if( id == SalaireTypeId )
			return SalaireTypeList[ i ].name;
	}
}

// Get user roles
var JsonRoles = cookies.get( "roles" ) != null ? 
				cookies.get( "roles" ) 
				: 
				JSON.stringify( ["Employe", "Repartiteur", "Gestionnaire", "Administrateur" ] );
// console.log( JsonRoles );
// var roles = JSON.parse( JsonRoles );
var roles = JsonRoles;


// Get account id to query ( user id ) 
var userid 	= cookies.get( "userid" ) ? cookies.get( "userid" ) : 10;
var accountId = "";
if( !roles.includes( "Administrateur" ) ){
	// setAccountId( userid );	// Id of connected user from the users cookie session
	accountId = userid;
}
else{
	let url 	= window.location.href;
	let query 	= 'employee_id'
	let id  	= getUrlParametter( query, url );

	if( id != null )
		accountId = id;
	else
		accountId = userid;
}


var defaultRole = "";
function getUserDefaultRole(){
	if( roles.includes( "Administrateur" ) )
		defaultRole = "Administrateur"
	else if( roles.includes( "Gestionnaire" ) )
		defaultRole = "Gestionnaire"
	else if( roles.includes( "Repartiteur" ) )
		defaultRole = "Repartiteur"
	else if( roles.includes( "Employe" ) )
		defaultRole = "Employe"
	
	return defaultRole
}
getUserDefaultRole();

// get current url
let code = ( cookies.get( 'code_entreprise' ) ) ? cookies.get( 'code_entreprise' ) : "2020"; //
	
// get company name
async function GetNomEntreprise(){
	
	try {
		let res = await fetch( lbdomain + "/NiovarRH/EntrepriseMicroservices/Entreprise/nomEntreprise/" + UserProfileId , {
			method: "GET",
			headers: {'Content-Type': 'application/json'},
		});
			
		let resJson = await res.json();
		if( res.status === 200 ) {
			setNomEntreprise(resJson.entreprise_nom);
		}
		else {
			alert( "Un probleme est survenu" );
			// setErrorColor( "red" );
			// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
		}
	} 
	catch (err) {
		//alert( "Vérifiez votre connexion internet svp" );
		console.log(err);
	};
}


function rndNumbers(length) {
	return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
}

function rndLetter(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function generateMatricule(){
	var matricule = rndLetter(3) + "" + rndNumbers(5);
	return matricule;
}

	
const UserProfile = () => {
	const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
	const [ spin01, setSpin01 ] = useState( false );
	const [ spin02, setSpin02 ] = useState( false );
	const [ spin03, setSpin03 ] = useState( false );
	const [ spin04, setSpin04 ] = useState( false );
	const [ spin05, setSpin05 ] = useState( false );
	const [ spin06, setSpin06 ] = useState( false );
	const [ spin07, setSpin07 ] = useState( false );

	const history = useHistory();

	const [ password, setPassword ]= useState(''); //	
	const [ repeatPassword, setRepeatPassword ]= useState(''); //
	
	const [ nomEntreprise, setNomEntreprise ]= useState(''); //	
	
	const [ role, setRole ]= useState(''); //	
	
	const [ profileId, setProfileId ] =  useState( '' );
	const [ dateEmbauche, setDateEmbauche ] =  useState( '' );
	const [ dateDepart, setDateDepart ]  =  useState( '' );  
	const [ paysId, setPaysId ] =  useState( '' );  
	const [ provinceId, setProvinceId ]	=  useState( '' );											
	const [ villeId, setVilleId ]=  useState( '' );	 			
	const [ statusId, setStatusId ] = useState( '' ); // User status

	const [ telephone01, setTelephone01 ] = useState( '' );
	const [ telephone02, setTelephone02 ] = useState( '' );
	const [ sexeId, setSexeId ] = useState( '' );
	const [ posteId, setPosteId ] =  useState( '' );
	const [ departementId, setDepartementId ] =  useState( '' );
	const [ salaryTypeName, setSalaryTypeName ] =  useState( '' );
	const [ salaire, setSalaire ] = useState( '' );	
		
	const [ activation , setActivation  ] = useState( '' );		
		
	const [ PaysList, setPaysList ] 		= useState( [] ); 	// Pays array's values top map
	const [ ProvinceList, setProvinceList ] = useState( [] ); 	// Provinces array's values to map
	const [ VilleList, setVilleList ] 		= useState( [] ); 	// Ville array's values to map

	const [ userWeekDays, setUserWeekDays ] = useState( '' );	// Default users days to checked

	const [ DepartementList, setDepartementList ] = useState( [] );  	// List of all departments to select
	const [ PosteList, setPosteList ] = useState([]); 				// List of all post to select


	const [ showProvince, setShowProvince ] = useState(false); //
	const [ showVille, setShowVille ] = useState(false); //
	
	const [ formType, setFormType ] = useState('');// Edition or new data

	const [ userSexeId, setUserSexeId ] = useState(''); //

	const [ weekDays, setWeekDays ] = useState( days ); //
	
	const [ choisir, setChoisir ] = useState( "Choisir" ); //
	
	const [ matricule, setMatricule ] = useState( '' );
	const [ salaryTypeid, setSalaryTypeid ] = useState( '' );
	const [ fullName, setFullName ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	
	const [ acceptCheckbox, setAcceptCheckbox ] = useState( false );
	
	const [ photoUrl, setPhotoUrl ] = useState( nopicPhotoUrl );
	
	
	// Handle password change
	const handleChangePassword = ( value ) => {
		setPassword( value );
	}
	
	// Handle password repeat change
	const handleChangePasswordRepeat = ( value ) => {
		setRepeatPassword( value );
	}
	
	// view password
	const [passwordShown01, setPasswordShown01] = useState(false);
	const togglePasswordVisiblity01 = () => {
		setPasswordShown01(passwordShown01 ? false : true);
	};

	// view confirmation
	const [passwordShown02, setPasswordShown02] = useState(false);
	const togglePasswordVisiblity02 = () => {
		setPasswordShown02(passwordShown02 ? false : true);
	};

	// Handle checkbox change
	const handleCheck = (index) => {
		let check = userWeekDays[index];
		let userWeekDayCopy 	= userWeekDays.slice();
		userWeekDayCopy[index]  = !check;
		setUserWeekDays( userWeekDayCopy );
	}
	
	// Handle checkbox accept conditions
	const handleCheckAccept = (e) => {
		let check = !acceptCheckbox;
		setAcceptCheckbox( check ) ;
	} 
	
	// Handle input change
	const handleChangeSalaire = (value) => {
		
		if( roles.includes( "Administrateur" ) ){	// only role Administrateur can change salaire
			setSalaire( value );
		}
	}
	
	// Handle input change
	const handleChangeMatricule = (value) => {
		
		if( roles.includes( "Administrateur" ) ){
			setMatricule( value );
		}
	}
		
	// Handle input change
	const handleChangeFullName = (value) => {
		setFullName( value );
	}
		
	// Handle input change
	const handleChangeEmail = (value) => {
		setEmail( value );
	}
		
	// Handle input change
	const handleChangeTelephone01 = (value) => {
		setTelephone01( value );
	}
		
	// Handle input change
	const handleChangeTelephone02 = (value) => {
		setTelephone02( value );
	}
	
	// Handle Role input change
	const handleChangeRole = (value) => {
		// never change
	}
	
	const [errorMessage, setErrorMessage] = useState('');
	const [errorMessageColor, setErrorMessageColor] = useState('');

	// Handle Satus input change
		const handleChangeStatus = (value) => {
		// never change
	}
	
	const circleImageCropedStyle = {
		objectFit: 'cover',
		borderRadius: '50%',
		height: '120px',
		width: '120px'
	}
	

	// Save profile
	const handleClickSave = async (e) => {
		setSpin01( true );
		e.preventDefault();
		
		// validation
		let validation = validations();
		if ( validation ){
			// alert( validation );
			setErrorMessageColor( "red" );
			setErrorMessage( validation );
			setSpin01( false );
			return;
		}
		
		var method = "";
		var path = "";
		if( !formType ){ // Nouveau
			method 	= "POST";
			path 	= "/NiovarRH/UserProfileMicroservices/UserProfile";
		}
		else{	// Edition
			method 	= "PUT";
			path 	= "/NiovarRH/UserProfileMicroservices/UserProfile/modifier/" + profileId;
		}

		var json = {
					"id" : ( profileId ) ? profileId : "undefined",
					"accountId": accountId,
					"telephone01": telephone01,
					"telephone02": telephone02,
					"sexeId": sexeId,
					"matricule": matricule,
					"departementId": departementId,
					"posteId": posteId,
					"typeSalaireId": salaryTypeid,
					"salaire": salaire,
					"dateEmbauche": dateEmbauche ? moment( dateEmbauche ).format( 'YYYY-MM-DDTHH:mm:ss' ) : 
					moment().format( 'YYYY-MM-DDTHH:mm:ss' ),
					"dateDepart": dateDepart ? 
						moment( dateDepart ).format( 'YYYY-MM-DDTHH:mm:ss' ) : 
						dateEmbauche ? 
							moment( dateEmbauche ).format( 'YYYY-MM-DDTHH:mm:ss' ) : 
							moment().format( 'YYYY-MM-DDTHH:mm:ss' ) ,
					"dateNaissance": "2022-09-24T23:01:27.829Z",
					"paysId": paysId,
					"provinceId": provinceId,
					"villeId": villeId,
					"photoUrl": "foo.jpg",
					"userProfileJour": []
				};
		
		if( !formType ) // Nouveau
			delete json.id;


		// save or modify profile
		try {
			var res = await fetch( lbdomain + path, {
				method: method,
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify( json )
				
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let userProfileId = resJson.userProfileId;
				
				setProfileId( userProfileId ); // Todo: use a useEffect

				saveUserJour( resJson.userProfileId ); //
				
				// alert( "Profile enregistré." );
				setErrorMessageColor( "green" );
				setErrorMessage( "Profile sauvegardé." );
			}
		}
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		}
			
		// update account info
		updateUser();
		setSpin01( false );
	}
	
	
	// Update a user
	const updateUser = async() => {
		// Update Account
		setSpin01( true );
		try {
			var res = await fetch( lbdomain + "/Accounts/" + accountId, {
				method: "PUT",
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					'accountId': accountId,
					'fullName': fullName,
					'role': role,
					'email': email,
					'password': password,
					'confirmPassword': repeatPassword
				}),
			});
			
			let resJson = await res.json();
			if( resJson.accountId ) {
				console.log('User updated');
				cookies.set( "nom", fullName, { path: "/" } ); // update fulName in the cookie
			}
		}
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		}
		setSpin01( false );
	}
	
	
	// validations
	const validations = () => {
		var validation = "";
		
		// full name
		if( fullName.length < 3 )
			validation = "Nom non valide";
		
		// email
		var validationCourriel = validationEmail( email );
		if( !validationCourriel )
			validation = "Email non valide";
		
		// telephone01
		var validationTelephone01 = validationPhoneNumber( telephone01 );
		if( !validationTelephone01 )
			validation = "Le numéro de téléphone n'est pas valide";
		
		// telephone02
		var validationTelephone02 = validationPhoneNumber( telephone02 );
		if( telephone02 && !validationTelephone02 ) // not mandatory
			validation = "Le numéro de téléphone du domicile n'est pas valide";
		
		// salaire
		if( salaire && salaire.isNaN ) // not mandatory
			validation = "Salaire non valide";
		
		// password
		var validationPass = validationPassword( password, repeatPassword );
		if( validationPass )
			validation = validationPass;
	
		// sexeId
		if( sexeId === '' ){
			validation = "Homme ou femme?"; 
		}
	
		// departementId, posteId
		if( departementId === '' )
			validation = "Choisissez un Département de travail"; 
		else if( posteId === '' )
			validation = "Choisissez un Poste de travail"; 
		
		// paysId, provinceId, villeId
		if( paysId === '' )
			validation = "Choisissez un Pays"; 
		else if( provinceId === '' )
			validation = "Choisissez une Province";
		else if( villeId === '' )
			validation = "Choisissez une Ville";
		
		return validation;
	}
	
	const validationEmail = (email) => {
		var re 	= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var rep = re.test(email);
		return rep;
	};
	
	const validationPhoneNumber = (number) => {
		var re 	= /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
        var rep = re.test(number);
		
		return rep;
	};

	/** password between 7 to 16 characters which contain only characters, numeric digits, underscore and first character must be a letter **/ 
	const validationPassword = ( password, passwordConfirmation ) => {
		let validation 	= "";
		var validator	=  /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;
		var length = password.length;

		if( password == "" && passwordConfirmation == "" )
			return ""
		else if( length == 0 )
			return "Saisir un mot de passe"
		else if( length < 7 )
			return "Le mot de passe doit avoir plus de 6 caractères"
		else if( length > 16 )
			return "Le mot de passe doit avoir moins de 16 caractères"
		else if( password != repeatPassword )
			return "Les mots de passe sont différents"
		else{
			var rep = validator.test(password);
			if( rep === false )
				return "Le mot de passe doit commençer par une lettre. Il peut être alphabétiqe, numérique et avec les caracteres !, @, #, $, %, ^, &, * .";
		}

		return validation
	};
	
	
	
	// Save user jours. Delete and recreate.
	async function saveUserJour( userProfileId ){	
		// Delete
		if( userWeekDays ){
			try{
				var res = await fetch( lbdomain + "/NiovarRH/UserProfileMicroservices/UserProfileJour/delete/" + profileId, {
					method: "DELETE",
					headers: {'Content-Type': 'application/json'},
				});
				let resJson = await res.json();
				if( resJson.statusCode === 200 ) {
					// console.log( 'saveUserJour: delete' ); 
				}
			}
			catch (err) {
				//alert( "Vérifiez votre connexion internet svp" );
				console.log(err);
			}
		}
		
// console.log( userWeekDays );
// console.log( userWeekDays.length );
		// Create user jours 
		for( var i = 0; i < userWeekDays.length; i++ ){  // Todo: ajust i nidx dynamicaly
			
			if( userWeekDays[i] === false )
				continue;

			var dayid 	= i;
			var path 	= "/NiovarRH/UserProfileMicroservices/UserProfileJour/postUserProfileJour/"; 
			
			try{
				var res = await fetch( lbdomain + path + userProfileId + "/" + dayid  , {
					method: "POST",
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						'userProfileId':userProfileId,
						'JourId':dayid
					})
				});
				let resJson = await res.json();
				if( resJson.statusCode === 200 ) {
					//console.log( 'saveUserJour: create' ); //
				}
			}
			catch (err) {
				//alert( "Vérifiez votre connexion internet svp" );
				console.log(err);
			}
		}
	}

	const handleSelectDepartement = (value) => {
		let departementId = value;
		setDepartementId( departementId );
		GetPostes(departementId);	// Load post of this department
		
	}

	const handleSelectPoste = (value) => {
		let posteId = value;
		setPosteId( posteId );
	}

	const handleSelectPays = (value) => {
		let paysId = value;
		setPaysId( paysId );
		GetProvinces(paysId); // load provinces of this pays

	}

	const handleSelectProvince = (value) => {
		let provinceId = value;
		setProvinceId( provinceId );
		GetVilles( provinceId ); // load villes of this province
	}

	const handleSelectSexe = (value) => {
		let sexeId = value;
		setSexeId( sexeId );
	}
	
	const handleSelectSalaireType = (value) => {
		if( roles.includes( "Administrateur" ) ){	// only role Administrateur can change salairy type
			setSalaryTypeid( value );
		}
	}
	
	const handleSelectStatus = (value) => {
		let statusId = value;
		setStatusId( statusId );
	}
	
	const handleSelectVille = (value) => {
		let villeId = value;
		setVilleId( villeId );
	}
	
	const handleSelectRole = (value) => {
		setRole( value );
		updateRole( value );	// save to backend
	}
	
	const handleSelectActivation = (value) => {
		setActivation( value );
		let activate = ( value == "Activé" ) ? 1 : 0;
		updateActivation( accountId, activate );
	}
	
	// Get pays
	async function getPays(){
		setSpin05( true );
		try {
			let res = await fetch( lbdomain + "/NiovarRH/UserAdressMicroservices/Pays", {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let pays = resJson.pays;
				setPaysList( pays ); 
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
		setSpin05( false );
	}
	

	
	// get user profile
	// var userProfileData = [];
	async function  getUserProfile(){
	
		try {
			let res = await fetch( lbdomain + "/NiovarRH/UserProfileMicroservices/UserProfile/ProfileFromAccount/" + accountId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
			 
				var userProfileData	= resJson.userProfile[0];
				if( userProfileData != null ){
					
					let userProfileId 	= userProfileData.id;
					setProfileId( userProfileId );
					
					let date_embauche = moment( userProfileData.dateEmbauche, 'YYYY-MM-DDTHH:mm:ss' ).format('YYYY-MM-DD');
					let date_depart	  = moment( userProfileData.dateDepart, 'YYYY-MM-DDTHH:mm:ss' ).format('YYYY-MM-DD');
					let dateEmbaucheObj 	=   new Date( date_embauche );
					let dateDepartObj		=   new Date( date_depart ) ;

					userProfileData.dateEmbauche = dateEmbaucheObj;
					userProfileData.dateDepart 	 = dateDepartObj;
				
					// user days to checkbox
					getUserJours( userProfileId );

					setDateEmbauche( userProfileData.dateEmbauche ); //
					setDateDepart( userProfileData.dateDepart );	// 
					
					setPaysId( userProfileData.paysId );	// Pays select's default value
			
						
					if( userProfileData.provinceId ){				// Display user defaut
						setShowProvince( true );
						GetProvinces( userProfileData.paysId );
						setProvinceId( userProfileData.provinceId );	// Provinces select's default value	
					}
					
					if( userProfileData.villeId ){				// Display user defaut
						setShowVille( true );
						GetVilles( userProfileData.provinceId )
						setVilleId( userProfileData.villeId );	// Villes select's default value
					}
					

					setTelephone01( userProfileData.telephone01 );
					setTelephone02( userProfileData.telephone02 );
					setSexeId( userProfileData.sexeId );
					
					setMatricule( userProfileData.matricule );
					
					setDepartementId( userProfileData.departementId );
					
					await GetPostes( userProfileData.departementId )
					
					setPosteId( userProfileData.posteId );

					let userTypeSalaireId = userProfileData.typeSalaireId;
					setSalaryTypeid( userTypeSalaireId );
					let salaryTypeName = getSalaryTypeName( userTypeSalaireId );
					setSalaryTypeName( salaryTypeName ); // for employee input type
			
					setSalaire( userProfileData.salaire );
					setStatusId( userProfileData.activation );
					setFormType( '1' );
				}
				else{
					setUserCheckedDaysArray( [] );
					setSalaryTypeName( 'Horaire' );
					
					var userMatricule = generateMatricule();
					setMatricule( userMatricule );

					setSalaryTypeid( 0 );
				}
				

				// setPassword( userProfileData.password );
				// setRepeatPassword( userProfileData.password );
			
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	}

	
	// get user account info
	async function getAccountInfo(){
		try {
			let res = await fetch( lbdomain + "/Accounts/" + accountId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			var accountInfo = "";
			let resJson = await res.json();
			if( resJson.accountId ) {
				accountInfo   = resJson;
				setFullName( accountInfo.fullName );
				setEmail( accountInfo.email );
				let activated = accountInfo.activation;
				let activation =  ( activated ) ? "Activé" : "Désactivé"
				setActivation( activation );
// alert( accountInfo.role );
				setRole( accountInfo.role );
				
				getUserProfile();
				
			}
			else {
				alert( "Compte non trouvé" );
				// history.push( "/liste-des-employes" );	
				location.replace( appdomain + "/liste-des-employes" )
				// history.back();
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		}
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	}


	async function getUserJours( userProfileId ){
		try {
			let res = await fetch( lbdomain + "/NiovarRH/UserProfileMicroservices/UserProfileJour/getUserProfileJour/" + userProfileId , {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let result 	= resJson.userProfileJours;
				let count 	= result.length;
				let userProfilJours = [];
				for( var i = 0; i < count; i++ ){
					let jourId = result[i].jourId;
					userProfilJours.push( jourId );
				}
// console.log( userProfilJours );
				setUserCheckedDaysArray( userProfilJours );
				
				// setWeekDays( userWeekDays ); 
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	}

	// Create initial user checked  array for week days checkboxes 
	function setUserCheckedDaysArray( userJours ){
		var userWeekDaysArray 	= [];
		for( var i = 0; i < days.length; i++ ){
			let to_check = false;
	
			if( userJours.includes( days[i].id ) )
				to_check = true;
			
			userWeekDaysArray.push( to_check );
			
		}
		setUserWeekDays( userWeekDaysArray );
	}
	
	
	// departement List
	async function getDepartements(){
		setSpin06( true );
		try {
			let res = await fetch( lbdomain + "/NiovarRH/DepartementMicroservices/Departement/Entreprise/" + code, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let departements = resJson.departement;
// console.log( departements );
				setDepartementList( departements );
				 
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
		setSpin06( false );
	}
	

	// get Postes
	async function GetPostes( departementId ){
		setSpin07( true );
		try {
			let res = await fetch( lbdomain + "/NiovarRH/DepartementMicroservices/Poste/Departement/" + departementId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let postes = resJson.poste;
				
				if( !postes.length == 0 )
					setPosteList( postes );
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
		setSpin07( false );
	}
	
	// Get ville
	async function GetVilles( provinceId ){
		setSpin04( true );
		try {
			let res = await fetch( lbdomain + "/NiovarRH/UserAdressMicroservices/Province/VillesProvince/" + provinceId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let villes = resJson.ville;
				setVilleList ( villes );
				setShowVille( true );
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
		setSpin04( false );
	}
	
	// Get provinces
	async function GetProvinces( paysId ){
		setSpin03( true );
		try {

			let res = await fetch( lbdomain + "/NiovarRH/UserAdressMicroservices/Pays/ProvincesPays/" + paysId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'},
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				let province = resJson.province;
				setProvinceList( province );
				setShowProvince( true );
			}
			else {
				alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
		setSpin03( false );
	}
	
	// file validation 
	const Filevalidation = ( userfile ) => {
		var filePath = userfile.name;

        // Allowing file type
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
             
        if (!allowedExtensions.exec(filePath)) {
            return('Type de fichier invalide ( .jpg et .png uniquement )');    
        }
			
        const fsize = userfile.size;
        // const file = Math.round((fsize / 1024));
        // The size of the file.
        if ( fsize >= 31457280 ) {
            return(
            "Taille de fichier superieure à 30 MO");
        } 
		else if ( fsize < 1024 ) {
            return(
                "Taille de fichier inférieure à 1 KO");
        }  
    }
	
	// Post photo profile 
	const handleChangeFile = async (event) => {
		
		setSpin02( true );
		const file = event.target.files[0];
		
		let validation = Filevalidation( file );
		
		if( validation ){
			alert( validation );
			return;
		}
		
		let formData = new FormData();
		formData.append('file', file);
		formData.append('userid', accountId);
		try{
			var res = await fetch( appfichierUrl + "/niovarpaie/post/photoprofile", {
				method: "POST",
				// headers: {'Content-Type': 'application/json'},
				body: formData
			})

			let resJson = await res.json();
			if( resJson.file_url ) {
				// get the uploaded file name
				var photo_url 	= resJson.file_url;
				var userid 		= resJson.userid;
				setPhotoUrl( photo_url );
				console.log( 'Photo saved' );
			}
			else{
				console.log( "Uploaded File error" );
			}
		}
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	};
	
	// GetPhotoProfile
	const getPhotoProfile = async () => {
		
		try{
			var res = await fetch( appfichierUrl + "/niovarpaie/get/photoprofile/" + accountId, {
				method: "GET",
				headers: {'Content-Type': 'application/json'}
			})

			let resJson = await res.json();
			// get the uploaded file name
			var photo_url = resJson.photoPath;
// console.log( "photo_url:" + photo_url );
			if( photo_url )
				setPhotoUrl( photo_url );
			
		}
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	};
	
		
		
	async function updateRole( role ){
		try {
			var res = await fetch( lbdomain + "/Accounts/" + accountId, {
				method: "PUT",
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					'role': role, 
				}),
			});
			
			let resJson = await res.json();
			if( resJson.statusCode === 200 ) {
				console.log('Userrole  updated');
			}
		} 
		catch (err) {
			//alert( "Vérifiez votre connexion internet svp" );
			console.log(err);
		};
	}
		
	async function updateActivation( employee_id, value ){
		try {
		let res = await fetch( lbdomain + "/NiovarRH/EmployeeListMicroservices/EmployeeList/EmployeeActivation/" + employee_id + "/" + value + "", {
			method: "GET",
			headers: {'Content-Type': 'application/json'},
		});

		let resJson = await res.json();
		if( res.status === 200 ) {
			if( resJson.result == 1 ){
				if( value == 0 )
					alert( "Employé désactivé" )
				else if ( value == 1 )
					alert( "Employé activé" )
			}
			else{
				alert( "Un probleme est survenu" );
			}
		}
		else {
			alert( "Un probleme est survenu" );
				// setErrorColor( "red" );
				// setErrorMessage( "Erreur de connexion. Reessayer plus tard" );
		}
	} 
	catch (err) {
		alert( "Vérifiez votre connexion internet svp" );
		console.log(err);
	};
	}
		
	useEffect(() => {
		getAccountInfo();
		getPays();
		getDepartements();
		getPhotoProfile();
	},[] );
	
			
    return (
       <>
	<div className="page-wrapper">
                <div className="content container-fluid">
					<div className="row">
                        <div className="col-xl-12 col-sm-12 col-12">
                            <div className="breadcrumb-path">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><a onClick={() => {
                                        window.location.href = "/"
                                    }}>Accueil</a>
                                    </li>
                                    <li id="breadcrumbTitle" className="breadcrumb-item active">Mon profile</li>
                                </ul>
                                <h3>Profile</h3>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-12 col-sm-12 col-12">
						
           

    <nav className="nav nav-borders">
        <a className="nav-link active ms-0" href="#" target="__blank">Profile</a>
        <a className="nav-link" href="#" target="__blank">Activité récente</a>
        <a className="nav-link" href="#" target="__blank">Performance</a>
        <a className="nav-link" href="#"  target="__blank">Documents</a>
    </nav>
    <hr className="mt-0 mb-4" />
    <div className="row">
        <div className="col-xl-4">
         
            <div className="card mb-4 mb-xl-0">
                <div className="card-header">
					<CameraOutlined
						style={{  color: 'blue'  }}
					/>&nbsp;
					Photo
				</div>
                <div className="card-body text-center">
                    
                    <img 
						style={ circleImageCropedStyle } 
						src={ photoUrl }
						alt="" />
                    <div className="small font-italic text-muted mb-4">JPG ou PNG de moins de 30 MB</div>
					<label 
						className="btn btn-primary" 
						onChange={e => handleChangeFile(e)} 
						htmlFor="uploadInput"
					>
						<input type="file" id="uploadInput" hidden />
						<Spin 
							indicator={antIcon} 
							spinning={spin02} 
							style={{ 
								width: '30px', 
								float: 'left',
								display: spin01 ? 'inline' : 'none',
							}} 
						/>
						&nbsp; Changer l'image &nbsp;
					</label>
                </div>
				<div className="card mb-4 mb-xl-0">
				<div className="card-header">
					<UserSwitchOutlined 
						style={{ color: 'blue' }}
					/>&nbsp;
					Rôle
				</div>
			{ roles.includes( "Administrateur" ) ? 
			<>
                <div className="card-body text-center">
					<select 
						className="custom-select"
						value = { role } 
						onChange={e => handleSelectRole( e.target.value )}						
					>
						{ RoleList.map((obj, index) => (
							<option 
								key={index} 
								value={obj.name}>{obj.name}
							</option>
						))}
					</select>
                </div>
			</>
			:
			<input
				onChange={e => handleChangeRole(e.target.value)}
									className="form-control" 
									type="text" 
									placeholder="Type de salaire" 
									value = { role }
			/>
			}
			
				</div>
				<div className="card mb-4 mb-xl-0">
				<div className="card-header">
					<SettingOutlined 
						style={{ color: 'blue' }}
					/>&nbsp;
					Status
				</div>
			{ roles.includes( "Administrateur" ) ? 
            <>   
                <div className="card-body text-center">
					<select 
						className="custom-select" 
						value = { activation } 
						onChange={e => handleSelectActivation( e.target.value )}	
					>
						<option> Activé</option>
						<option> Désactivé</option>
					</select>
                </div>
			</>
			:
				<input
				onChange={e => handleChangeStatus(e.target.value)}
									className="form-control" 
									type="text" 
									placeholder="Activation" 
									value = { activation }
				/>
			}
				</div>
            </div>
        </div>
        <div className="col-xl-8">
           
            <div className="card mb-4">
                <div className="card-header">
					<ProfileOutlined 
						style={{  color: 'blue'   }}
					/>&nbsp;
					Détails du profile</div>
                <div className="card-body">
                    <form>
                       <div className="row gx-3 mb-3">
                           
                            <div className="col-md-6">
                                <User /> <label className="small mb-1">Nom complet</label>
                                <input 
									onChange={e => handleChangeFullName(e.target.value)} 
									className="form-control" 
									type="text" 
									placeholder="Votre nom complet" 
									value= { fullName }
								/>
                            </div>
                           <div className="col-md-6">
                                <Mail /> <label className="small mb-1">Email</label>
                                <input 
									onChange={e => handleChangeEmail(e.target.value)}
									id="email"
									className="form-control" 
									type="email" 
									placeholder="Votre adresse courriel" 
									value = { email } 
								/>
                            </div>
                        </div>
                        <div className="row gx-3 mb-3">
                           
                            <div className="col-md-6">
                                <Smartphone /> <label className="small mb-1" >Téléphone </label>
                                <input 
									onChange={e => handleChangeTelephone01(e.target.value)}
									className="form-control" 
									type="text" 
									placeholder="Numéro de téléphone" 
									value = { telephone01 } 
								/>
                            </div>
                           <div className="col-md-6">
                                <Phone /> <label className="small mb-1" >Téléphone domicile</label>
                                <input 
									onChange={e => handleChangeTelephone02(e.target.value)}
									className="form-control" 
									type="text" 
									placeholder="Téléphone du domicile" 
									value = { telephone02 } 
								/>
                            </div>
                        </div>
						
						<div className="row gx-3 mb-3">
							<div className="col-md-6">
                                <Users /> <label className="small mb-1" >Sexe </label>
								<select 
								className="custom-select" 
								value = { sexeId } 
								onChange={e => handleSelectSexe(e.target.value)} >
									{ !sexeId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ SexeList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
								</select>
                            </div>
                           <div className="col-md-6">
                                <Hash /> <label className="small mb-1" >Numéro de matricule</label>
                                <input 
									className="form-control" 
									type="text" 
									placeholder="Numéro de l'employé" 
									value = { matricule }
									onChange={e => handleChangeMatricule(e.target.value)} 
								/>
                            </div>
                        </div>
                        <div className="row gx-3 mb-3">
							<div className="col-md-6">
								<Spin 
									indicator={antIcon} 
									spinning={spin06} 
									style={{ 
										width: '30px', 
										float: 'left',
										display: spin06 ? 'inline' : 'none',
									}} 
								/>
                                <Clipboard /> <label className="small mb-1" >Département</label>
								<select 
								className="custom-select" 
								value = { departementId } 
								onChange={e => handleSelectDepartement(e.target.value)} >
									{ !departementId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ DepartementList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
								</select>
                            </div>
							<div className="col-md-6">
								<Spin 
									indicator={antIcon} 
									spinning={spin07} 
									style={{ 
										width: '30px', 
										float: 'left',
										display: spin07 ? 'inline' : 'none',
									}} 
								/>
                                <Briefcase /> <label className="small mb-1" >Poste</label>
								<select 
								className="custom-select" 
								value = { posteId } 
								onChange={e => handleSelectPoste(e.target.value)} >
									{ !posteId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ PosteList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
								</select>
                            </div>
						</div>
						<div className="row gx-3 mb-3">
							
                            <div className="col-md-6">
                                <Trello /> <label className="small mb-1" >Type de salaire</label>
							{ !roles.includes( "Administrateur" ) ? 
								<input
									onChange={e => handleChangeSalaire(e.target.value)}
									className="form-control" 
									type="text" 
									placeholder="Type de salaire" 
									value = { salaryTypeName } />					
							:
								<select 
									className="custom-select" 
									value = { salaryTypeid } 
									onChange={e => handleSelectSalaireType(e.target.value)} 
								>
									{ !salaryTypeid ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ SalaireTypeList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
								</select>
							}
                            </div>
                           
                            <div className="col-md-6">
                                <DollarSign /> <label className="small mb-1" >Salaire</label>
								<input 
									onChange={e => handleChangeSalaire(e.target.value)} 
									className="form-control" 
									type="text" 
									placeholder="0" 
									value = { salaire ? salaire : "0" }
								/>
                            </div>
                        </div>
						<div className="row gx-3 mb-3"> 
                        
                            <div className="col-md-6">
                                <Calendar /> <label className="small mb-1" >Date d'embauche</label>
								<DatePicker 
									locale="fr" 
									className="form-control" 
									id="dateEmbauche" 
									selected= { dateEmbauche }
									onChange={(date) => setDateEmbauche(date)}
									dateFormat="dd MMMM yyyy"
									placeholderText= { "Choisir" }
								/>
                            </div>
                           
                            <div className="col-md-6">
                                <Calendar /> <label className="small mb-1" >Date de départ</label>
								<DatePicker 
									locale="fr" 
									className="form-control" 
									id="dateDepart" 
									selected= { dateDepart }
									onChange={(date) => setDateDepart(date)}
									dateFormat="dd MMMM yyyy"
									placeholderText= { "Choisir" }
								/>
                            </div>
							
                        </div>
						<div className="mb-3">
							<Spin 
								indicator={antIcon} 
								spinning={spin05} 
								style={{ 
									width: '30px', 
									float: 'left',
									display: spin05 ? 'inline' : 'none',
								}} 
							/>
                            <Globe /> <label className="small mb-1" >Pays</label>
							<select 
								className="custom-select" 
								value = { paysId } 
								onChange={e => handleSelectPays(e.target.value)} >
									{ !paysId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ PaysList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
							</select>
							
                        </div>
						{ ( !showProvince ) ? 
						<>&nbsp;</> 
						:
						<div className="mb-3">
							<Spin 
								indicator={antIcon} 
								spinning={spin03} 
								style={{ 
									width: '30px', 
									float: 'left',
									display: spin03 ? 'inline' : 'none',
								}} 
							/>
                            <Map /> <label className="small mb-1" >Province</label>
                           	<select 
								className="custom-select" 
								value = { provinceId } 
								onChange={e => handleSelectProvince(e.target.value)} >
									{ !provinceId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ ProvinceList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
							</select>
                        </div>
						}
						{ ( !showVille ) ? 
						<>&nbsp;</> 
						:
						<div className="mb-3">
							<Spin 
								indicator={antIcon} 
								spinning={spin04} 
								style={{ 
									width: '30px', 
									float: 'left',
									display: spin04 ? 'inline' : 'none',
								}} 
							/>
                            <MapPin /> <label className="small mb-1" >Ville</label>
							<select 
								className="custom-select" 
								value = { villeId } 
								onChange={e => handleSelectVille(e.target.value)} >
									{ !villeId ? 
										<option value="choisir">choisir</option> 
									: 
										"" 
									}
									{ VilleList.map((obj, index) => (
										<option 
											key={index} 
											value={obj.id}>{obj.name}
										</option>
									))}
							</select>
                        </div>
						}
						<div className="mb-3">
                            <Sun /> <label className="small mb-1" >Vos jours de disponibilité</label>
							<div className="col-sm-18 checkbox-wrapper list-unstyled">
							{weekDays.map((obj, index) => (
								<li key={index}>
									<div className="checkbox-inline">
										<input 
											type="checkbox"
											id={`custom-checkbox-${index}`}
											name={obj.name}
											value={obj.name}
											checked= { userWeekDays[index] }
											onChange={() => handleCheck(index)}
										/>
										&nbsp;<label htmlFor={`custom-checkbox-${index}`}>{obj.name}</label>
									</div>
								</li>
							))}
							</div>
                        </div>
						
						<div className="row gx-3 mb-3">
                            <div className="col-md-6">
                                <UnlockOutlined /> <label className="small mb-1" >Mot de passe</label>
								<div className="pass-group"
									style={{ 
										display: 'flex'
									}}
								> 
									<input 
										value = { password }
										id="password" 
										placeholder="Mot de passe" 
										onChange={e => handleChangePassword(e.target.value)}
										name="motDePasse" 
										type= {passwordShown01 ? "" : "password"}
										className="form-control pass-input" 
										style={{ 
											width: '95%', 
											float: 'left'
										}}
									/> &nbsp;
									<i 
										onClick={togglePasswordVisiblity01}
										style={{ 
											width: '15px', 
											cursor: 'pointer',
											float: 'left',
											marginLeft: '2px'
										}}
									>
										<EyeOutlined 
										/>
									</i> 
                                </div>

                            </div>
							
                            <div className="col-md-6">
                                <Lock /> <label className="small mb-1" >Repeter le mot de passe</label>
                                
								<div className="pass-group"
									style={{ 
										display: 'flex'
									}}
								>
									<input 
										value = { repeatPassword }
										id="repeatPassword" 
										placeholder="Répétition du mot de passe" 
										onChange={e => handleChangePasswordRepeat(e.target.value)} 
										name="motDePasse" 
										type= {passwordShown02 ? "" : "password"}
										className="form-control pass-input" 
										style={{ 
											width: '95%', 
											float: 'left'
										}}
									/> &nbsp;
									<i 
										onClick={togglePasswordVisiblity02}
										style={{ 
											width: '15px', 
											cursor: 'pointer',
											float: 'left',
											marginLeft: '2px'
										}}
									>
										<EyeOutlined 
										/>
									</i> 
                                </div>
                            </div>
                        </div>
						<input 
							type="checkbox"
							id='cbaccept'
							name='cbaccept'
							value='cbaccept'
							checked= { acceptCheckbox }
							onChange={e => handleCheckAccept(e)} 
						/> &nbsp;<a href = "#">Accepter les termes et conditions d'utilisation</a>
                        <button 
							className="btn btn-primary" 
							type="button"  
							onClick={handleClickSave}
							disabled={ !acceptCheckbox }
							style={{ 
								width: '100%', 
							}} 
						>
							<Spin 
									indicator={antIcon} 
									spinning={spin01} 
									style={{ 
										width: '30px', 
										float: 'left',
										display: spin01 ? 'inline' : 'none',
									}} 
								/>
							&nbsp;
							{ !formType ? 
								"Enregistrer"
								: 
								"Modifier"
							}&nbsp;
						</button>&nbsp;

						{errorMessage && (
							<p style={{color: errorMessageColor}}> {errorMessage} </p>
						)}<br/>
                    </form>
            </div>
        </div>
    </div>
</div>

						</div>
					</div>
				</div>
		  </div>
       </>
    );
}

export default UserProfile;