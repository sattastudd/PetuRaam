/* This module acts as the service layer.
 * It should perform validations and send mail.
 */

var loginDBI = require( '../../daoLayer/login/LoginDBI' );

var loginUser = function( user, callback ) {
	console.log( 'In LoginService | Starting Execution of loginUser' );

	/*Perform validtions here.
	 */
	loginDBI.loginUser( user, function( err, result ) {

		if( err ) {
			console.log( err );
			callback( err );
		} else {
			callback( null, result );
		}
	});

	console.log( 'In LoginService | Finished Execution of loginUser' );
}

var signUpUser = function( userInfo, callback ) {

	console.log( 'In LoginService | Starting Execution of signUpUSer' );

	/*Peform validations here.
	 */
	loginDBI.signUpUser( userInfo, function( err, result ) {
		
		if( err ) {
			callback( err );
		} else {
			callback( null, result );
		}
	});

	console.log( 'In LoginService | Finished Execution of signUpUser' );
};

var isUserAlreadyInSystem = function( email, callback ) {
	console.log('In LoginService | Starting Execution of isUserAlreadyInSystem' );

	/*Peform Validations here.
	 */
	loginDBI.isUserAlreadyInSystem( email, function( err, result ) {

		if( err ) {
			callback( err );
		} else {
			callback( null, result );
		}
	});
	console.log('In LoginService  | Finished Execution of isUserAlreadyInSystem' );
};

exports.loginUser = loginUser;
exports.signUpUser = signUpUser;
exports.isUserAlreadyInSystem = isUserAlreadyInSystem;