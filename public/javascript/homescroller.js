// // $(function(){
// // 	$('#content-box').boxSlider();
// // })

// $(document).ready(function() {

// 	/* basic - default settings */
// 	$('.iosSlider').iosSlider();
	
// 	/* some custom settings */
// 	$('.iosSlider').iosSlider({
// 		snapToChildren: true,
// 		scrollbar: true,
// 		scrollbarHide: false,
// 		desktopClickDrag: true,
// 		scrollbarLocation: 'bottom',
// 		scrollbarHeight: '6px',
// 		scrollbarBackground: 'url(/img/straws.png) repeat 0 0',
// 		scrollbarBorder: '1px solid #000',
// 		scrollbarMargin: '0 30px 16px 30px',
// 		scrollbarOpacity: '0.75',
// 		onSlideChange: changeSlideIdentifier
// 	});



// });

$(document).ready(function() {
				
				$('.iosSlider').iosSlider({
					snapToChildren: true,
					desktopClickDrag: true,
					keyboardControls: true,
					onSliderLoaded: sliderTest,
					onSlideStart: sliderTest,
					onSlideComplete: slideComplete,
					navNextSelector: $('.next'),
				    navPrevSelector: $('.prev'),
				    autoSlide: true,
				    autoSlideTimer:4000
				});
				
			});
			
			function sliderTest(args) {
				try {
					console.log(args);
				} catch(err) {
				}
			}
			
			function slideComplete(args) {
			
				$('.next, .prev').removeClass('unselectable');
				
			    if(args.currentSlideNumber == 1) {
			
			        $('.prev').addClass('unselectable');
			
			    } else if(args.currentSlideNumber == 6) {
			
			        $('.next').addClass('unselectable');
			
			    }
			
			}