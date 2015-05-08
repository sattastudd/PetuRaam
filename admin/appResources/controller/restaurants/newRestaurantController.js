define([], function ($scope) {
    function newRestaurantController() {
    };
    return newRestaurantController;
});

function NewRestaurantController($scope, $http, $rootScope, $timeout, DataStore, AppConstants, RestRequests) {
    
    /* Flag to detect if we are editing an already existing restaurant or creating a new.*/
    $scope.isEdit = false;

    $scope.selectedLocations = [];
    $scope.finalDeliveryAreas = [];
    $scope.deliveryAreas = [];

    $scope.selectedCuisines = [];
    $scope.finalSelectedCuisines = [];
    $scope.offeredCuisines= [];

    $scope.restaurant = {};

    $scope.err = {address : {}};
    $scope.errMsg = {};

    /* Flags to control error and success message visibility.*/
    $scope.isServerError = false;

    $scope.isServerSuccess = false;
    $scope.successMessage = '';

    $scope.errorMessage = '';

    /* Restaurant creation is divided into five stages. 
     * We will be using these stages to control the action to be taken on click on tabs.*/
    $scope.restaurantStages = [ 'basicDetails', 'deliveryAreas', 'cuisineArea', 'restMenu', 'imgUpload'];

    /* We will be firing a options request to retirive locations and cuisines. */
    var optionsRequest = AppConstants.adminServicePrefix + '/' + RestRequests.options;

    /* Init method to check if we are editing an already existing restaurant. 
     * If yes, we need to retrieve its full details using its slug field.
     * Since, slug field can itself be edited now, we would need to maintain a backup copy of it for now.
     * Which would be stored in $scope.restaurantOldSlug.*/
    $scope.init = function () {

        /* This flag would be set by another page. 
         * To avoid any re read issue, we will be deleting such flags and values as well.
         * If this flag is true, it would means we are editing.
         * If it isn't, we would have set some defaults like new restaurant's stage and its current stageIndex.*/
        if( DataStore.readAndRemove( 'isRestaurantEdit' )) {

            $scope.isEdit = true;

            $scope.restaurant.slug = DataStore.readAndRemove( 'toEditRestaurant');

            /* If we have a proper slug value stored in DataStore.*/
            if( angular.isDefined( $scope.restaurant.slug )) {

                var requestName = AppConstants.adminServicePrefix + '/' + RestRequests.restaurant + '/' + $scope.restaurant.slug;

                $http.get(requestName)
                    .success(function (data) {
                        $scope.restaurant = data.data;

                        $scope.restaurantOldSlug = $scope.restaurant.slug;

                        $scope.restaurant.street = $scope.restaurant.address.street;
                        $scope.restaurant.locality = $scope.restaurant.address.locality;
                        $scope.restaurant.town = $scope.restaurant.address.town;

                        $scope.restaurant.city = $scope.restaurant.address.city;
                        $scope.restaurant.postal_code = $scope.restaurant.address.postal_code;

                        $scope.restaurantStageIndex = $scope.restaurantStages.indexOf( $scope.restaurant.stage );

                    })
                    .error(function (data) {
                        $scope.isServerError = true;
                        $scope.isServerSuccess = false;

                        $scope.errorMessage = data.msg;
                    })
            }
        } else {
            $scope.restaurant.stage = 'basicDetails';
            $scope.restaurantStageIndex = $scope.restaurantStages.indexOf( $scope.restaurant.stage );
        }

        /* Since, once we have retrived cuisines and locations from database, we also store it in DataStore for reuse.*/
        /* If the key representing cuisines storage is not there, we will fire request to fetch the same. */
        if( !DataStore.isKeyDefined( 'cuisines')) {

            $http.get(optionsRequest)
                .success(function (data) {
                    DataStore.storeData('cuisines', data.data.cuisines);
                    DataStore.storeData('locations', data.data.locations);

                    $scope.deliveryAreas = data.data.locations;
                    $scope.offeredCuisines = data.data.cuisines;

                })
                .error(function (data) {
                    console.log(data);
                });
        } else {
            $scope.deliveryAreas = DataStore.getData( 'locations' );
            $scope.offeredCuisines = DataStore.getData( 'cuisines' );
        }
    };

    /*                       Controls of delivery Area Stage                       */
    /*=============================================================================*/
    /* Left Panes */
    
    /* This method is used to return a class for the left pane of delivery areas.
     * We maintain a seprate list of selectedLocations,
     * if the passed location is present in the list,
     * we would return 'active'
     */
    $scope.isLocationSelected = function (location) {
        var locationLength = $scope.selectedLocations.length;

        for (var i = 0; i < locationLength; i++) {
            var loc = $scope.selectedLocations[i];

            if (loc === location) {
                return 'active';
            }
        }

        return '';
    };

    /* By Toggle Selection, we mean that if a location is present in selectedLocations,
     * On toggle, it would be removed or added depending upon its current state.*/
    $scope.toggleLocationSelection = function( location ){
        var locationsLength = $scope.selectedLocations.length;

        for( var i = 0; i < locationsLength; i++ ){
            var loc = $scope.selectedLocations[i];

            if( loc === location ){
                $scope.selectedLocations.splice(i, 1);
                return;
            }
        }

        $scope.selectedLocations.push( location );
    };

    /* With this, we will move selectedlocations into finalDeliveryAreas,
     * We will push locations into finalDeliveryAreas, so, we also need to remove selectedLocations from inital list as well.
     * And flush down selectedLocations as well. */
    $scope.makeSelectionFinal = function () {
        var locationsLength = $scope.selectedLocations.length;

        for( var i=0; i < locationsLength ; i++) {
            var selectedLocation = $scope.selectedLocations[i];
            $scope.finalDeliveryAreas.push( selectedLocation );

            var deliveryAreasLength = $scope.deliveryAreas.length;

            for( var j=0; j<deliveryAreasLength; j++){
                var location = $scope.deliveryAreas[ j] ;

                if( location === selectedLocation ){
                    $scope.deliveryAreas.splice(j, 1 );
                    break;
                }
            }
        };

        $scope.selectedLocations = [];
    };

    /* With this we will remove a final selected location and add it to initial location list.*/
    $scope.removeLocationFromSelection = function( location ) {
        var locationsLength = $scope.finalDeliveryAreas.length;

        for( var i=0; i<locationsLength; i++){
            var loc = $scope.finalDeliveryAreas[i];

            if( loc === location ){
                $scope.finalDeliveryAreas.splice(i, 1 );
                break;
            }
        }

        $scope.deliveryAreas.push( location );
    };

    /*Cuisine Controls*/

    /*                       Controls of cuisine Area Stage                       */
    /*=============================================================================*/
    /* This method is used to return a class for the left pane of cuisine areas.
     * We maintain a seprate list of slectedCuisines,
     * if the passed cuisine is present in the list,
     * we would return 'active'
     */
    $scope.isCuisineSelected = function( cuisine ){
        var selectedCuisinesLength = $scope.selectedCuisines.length;

        for( var i=0; i< selectedCuisinesLength; i++){
            var cuisineAt = $scope.selectedCuisines[ i ];

            if( cuisineAt === cuisine ){
                return 'active';
            }
        }
        return '';
    };

    /* By Toggle Selection, we mean that if a cuisine is present in selectedcuisines,
     * On toggle, it would be removed or added depending upon its current state.*/
    $scope.toggleSelectionForCuisine = function( cuisine ){
        var selectedCuisinesLength = $scope.selectedCuisines.length;

        for( var i=0; i< selectedCuisinesLength; i++){
            var cuisineAt = $scope.selectedCuisines[ i ];

            if( cuisineAt === cuisine ){
                $scope.selectedCuisines.splice(i, 1 );
                return ;
            }
        }

        $scope.selectedCuisines.push( cuisine );
    };

    /* With this, we will move selectedCuisines into finalSelectedCuisines,
     * We will push cuisines into finalSelectedCuisines, so, we also need to remove selectedCuisines from inital list as well.
     * And flush down selectedCuisines as well. */
    $scope.makeCuisineSelectionFinal = function  (){
 
        var selectedCuisinesLength = $scope.selectedCuisines.length;

        for( var i=0;i< selectedCuisinesLength; i++){
            var selectedCuisine = $scope.selectedCuisines[i];

            $scope.finalSelectedCuisines.push( selectedCuisine );

            var offeredCuisinesLength = $scope.offeredCuisines.length;

            for( var j=0; j< offeredCuisinesLength; j++){
                var cuisineAt = $scope.offeredCuisines[ j ];

                if( cuisineAt === selectedCuisine ){
                    $scope.offeredCuisines.splice(j, 1);
                    break;
                }
            }
        }

        $scope.selectedCuisines = [];
    };

    /* With this we will remove a final selected location and add it to initial location list.*/
    $scope.removeCuisineFromSelection = function( cuisine ) {

        var selectedCuisinesLength = $scope.finalSelectedCuisines.length;

        for( var i=0;i<selectedCuisinesLength; i++){
            var cuisineAt = $scope.finalSelectedCuisines[i];

            if( cuisineAt === cuisine ){
                $scope.finalSelectedCuisines.splice(i, 1);
                break;
            }
        }

        $scope.offeredCuisines.push( cuisine );
    };

    /*                       Controls of Restaurant Price Stage                       */
    /*=============================================================================*/

    /* Restaurant Menu */
    $scope.restMenu = $scope.restaurant.menu = [];

    /* Method to add a new category to menu. */
    $scope.addNewCategory = function () {
        var newMenu = {
            title : '',
            items : []
        };

        $scope.restMenu.push( newMenu );
    };

    /* Method to add item into category. */
    $scope.addNewItemInCategory = function( menu ){
        var dish = {
            title : '',
            type : '',
            veg : '',
            price : {
                half : '',
                full : ''
            }
        };

        menu.items.push( dish );
    };

    /*                       Controls of Image Upload Stage                       */
    /*=============================================================================*/

    $scope.files = [];

    /* This method would be used to create restaurants and would be accessible on basic details tab.
     * On others, it would be like updating details of existing restaurant.
     */
    $scope.createRestaurant = function () {

        var requestName = AppConstants.adminServicePrefix + '/' + RestRequests.restaurants;

        /* If we are editing restaurant, we should use saveAndContinue instead,
         * as createNewRestaurant doesn't handles multipart request.*/
        if( $scope.isEdit ) {
            $scope.saveAndContinue();
        } else {
            $http.post(requestName, $scope.restaurant)
                .success(function (data, status, headers, config) {
                    $scope.isServerError = false;
                    $scope.isServerSuccess = true;

                    $scope.successMessage = data.msg;

                    $scope.restaurant.stage  = data.data.stage;

                    $scope.err = data.err;
                    $scope.errMsg = data.errMsg;

                    /* Now we, are on same page. */
                    $timeout( function() {
                        $scope.isEdit = true;
                    }, 500 );

                    /* Time to move on to next stage as well. */
                    $scope.restaurantStageIndex = $scope.restaurantStages.indexOf( $scope.restaurant.stage );

                    if( $scope.restaurantStageIndex !== ($scope.restaurantStages.length -1 )) {
                        $scope.restaurant.stage = $scope.restaurantStages[ ++$scope.restaurantStageIndex ];
                    }
                })
                .error(function (data, status, headers, config) {
                    $scope.isServerError = true;
                    $scope.isServerSuccess = false;

                    $scope.errorMessage = data.msg;

                    $scope.err = data.err;
                    $scope.errMsg = data.errMsg;                   
                });
        }
    };

    /* SaveAndContinue would help in saving restaurant in stages. */
    $scope.saveAndContinue = function () {        

        var requestName = AppConstants.adminServicePrefix + '/' + RestRequests.restaurant + '/' + $scope.restaurantOldSlug;

        $http({
            method: 'PUT',
            url: requestName,
            headers: { 'Content-Type': undefined },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("model", angular.toJson(data.model));

                for (var i = 0; i < data.files.length; i++) {
                    formData.append("file" + i, data.files[i]);
                }

                return formData;
            },

            data: { model: $scope.restaurant, files: $scope.files }
        }).
            success(function (data, status, headers, config) {
                $scope.isServerError = false;
                $scope.isServerSuccess = true;

                $scope.successMessage = data.msg;

                $scope.err = data.err;
                $scope.errMsg = data.errMsg;

                /* With this, we would be able to move to next tab automatically. */
                $rootScope.$broadcast('moveToPetooTab', 1 );

                /* A little bit of stage handling. */
                $scope.restaurantStageIndex = $scope.restaurantStages.indexOf( $scope.restaurant.stage );

                if( $scope.restaurantStageIndex !== ($scope.restaurantStages.length -1 )) {
                    $scope.restaurant.stage = $scope.restaurantStages[ ++$scope.restaurantStageIndex ];
                }

                $scope.restaurantOldSlug = data.data.slug;
            }).
            error(function (data, status, headers, config) {
                $scope.isServerError = true;
                $scope.isServerSuccess = false;

                $scope.errorMessage = data.msg;

                $scope.err = data.err;
                $scope.errMsg = data.errMsg;

                if( $scope.restaurant.stage === 'basicDetails' ){
                    delete $scope.restaurant.stage;
                }
            });
    };


    /* Error Getter */
    /* Validation Getters */
    $scope.hasFieldError = function ( type ) {

        if( type.split('.').length === 1 )
            return $scope.err[ type ] ? '' : 'noHeight';
        else {
            var splitArray = type.split( '.' );

            var firstPart = splitArray[ 0 ];
            var secondPart = splitArray[ 1 ];

            var temp = $scope.err[ firstPart ];
            return temp[secondPart] ? '' : 'noHeight';
        }
    };


    $scope.haveReceivedErrorFromServer = function() {
        return $scope.isServerError ? '' : 'noHeight';
    };

    $scope.haveReceivedSuccessFromServer = function(){
        return $scope.isServerSuccess ? '' : 'noHeight';
    };

    $scope.isTabDisabled = function( name ) {

        var tabNameIndex = $scope.restaurantStages.indexOf( name );

        if( $scope.restaurantStageIndex < tabNameIndex ) {
            return true;
        } else {
            return false;
        }
    };

    $scope.getMessageForBasicDetailsButton = function () {
        return $scope.isEdit ? 'Update Restaurant Info' : 'Create New Restaurant' ;
    };
};
