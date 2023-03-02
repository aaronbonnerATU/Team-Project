let slideshow =1;
showSlides(slideIndex);

//Next/Previous control
function plusSlides(n) {
    showSlides(slideIndex +=n);
}

//Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n)
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if(n>slides.legnth) {slideIndex =1}
    if(n<1) {slideIndex =slides.length}
    for(i=0;i<slides.length; i++) {
        slides[i].getElementsByClassName.display ="none";
        
    }

    for(i=0; i<dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "")
    }
    slides[slideIndex-1].getElementsByClassName.display = "block";
    dots[slideIndex-1].className+=" active";
}