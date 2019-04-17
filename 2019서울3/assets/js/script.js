//clone
let cGrid = $(".contents>div:eq(0)").clone(), //content clone
tGrid = $(".table-bordered tbody>tr:eq(0)").clone(); //tabel clone
let init = true; //get init
//JSON
let data = "", //json data
category = []; //json category
// localStorage 
let cart, //cart
title, //category title
search; //search keyword

$.getJSON("./music_data.json", function(json){ //get JSON
   $("head").append('<style>*{user-select:none;}span.highlight{display:inline;background:#ff0;}</style>');
   $("#main-menu>li").eq(2).remove();
   $(".contents").css({"position":"unset"});
   data= json.data;
   category= Array.from(new Set(data.map(v => v.category)));
   data= data.sort((a, b) => new Date(b.release) - new Date(a.release));
   category.map(v => {
      $("#main-menu").append(`<li><a href="#"><i class="fa fa-youtube-play fa-2x"></i> <span>${v}</span></a></li>`);
   });
   cart= localStorage.getItem("cart") == null ? {} : JSON.parse(localStorage.getItem("cart"));
   title= localStorage.getItem("title") == null ? "ALL" : localStorage.getItem("title");
   search= localStorage.getItem("search") == null ? "" : localStorage.getItem("search");
   event();
   $(`span:contains('${title}')`).click();
   if(search != ""){
      $(".text-center input").val(search);
      $(".text-center button").click();
   }
});

function event(){ //event
   $(document)
   .on("click", "#main-menu>li:not(.text-center)", function(){ //menu click
      if(init){
         init = false;
      }else{
         search = "";
      }
      $(".text-center input").val(search);
      $(".active-menu").removeClass("active-menu");
      $(this).find("a").addClass("active-menu");
      title = $(this).find("span").text();
      setContent();
   })
   .on("click", ".btn-xs", function(){ //add btn click
      let idx = $(this).data("idx");
      cart[idx] == null ? cart[idx]=1 : cart[idx]++;
      setCart();
   })
   .on("click", ".text-center button", function(){ //search btn click
      search = $(".text-center input").val();
      setContent();
   })
   .on("keyup", ".text-center input", function(e){ //search input enter event
      if(e.keyCode == 13)
         $(".text-center button").click();
   })
   .on("input", "tr input", function(){ //cart input change
      if($(this).val() <= 0) $(this).val(1);
      let idx = $(this).parents("tr").data("idx");
      cart[idx] = Number($(this).val());
      $(`tr[data-idx="${idx}"] .pricesum`).text("\\ "+(parseInt(data[idx].price)*cart[idx]).toLocaleString());
      setCart(true);
   })
   .on("click", "tr button", function(){ //cart delete
      if(!confirm("정말 삭제 하시겠습니까?")) return;
      let idx = $(this).parents("tr").data("idx");
      delete cart[idx];
      $(`.btn-xs[data-idx="${idx}"]`).html(`<i class="fa fa-shopping-cart"></i> 쇼핑카트담기`);
      setCart();
   })
   .on("click", ".modal-footer .btn-primary", function(){ //payment
      if($("tbody tr").length == 0) return alert("앨범이 없습니다.");
      alert("결제가 완료되었습니다.");
      for(let i in cart)
         delete cart[i];
      $(".btn-xs").html('<i class="fa fa-shopping-cart"></i> 쇼핑카트담기');
      setItem();
      setCart();
      $("#myModal").click();
   })
}

function setItem(){ //localStorage setItem
   localStorage.setItem("cart", JSON.stringify(cart));
   localStorage.setItem("title", title);
   localStorage.setItem("search", search);
}

function setContent(){ //contents set grid
   setItem();
   $(".contents").empty();
   $(".row h2").text(title);
   data.map((v, n) => {
      if(title != "ALL" && title != v.category) return;
      let c = cGrid.clone().attr("data-idx", n).css({"position":"unset", "height":432+"px"});
      c.find("img").attr("src", "/images/"+v.albumJaketImage).attr("alt", v.albumName);
      c.find("h5").text(v.albumName);
      c.find("span:eq(0)>p").text(v.artist);
      c.find("span:eq(1)>p").text(v.release);
      c.find("span:eq(2)>p").text("\\ "+parseInt(v.price).toLocaleString());
      c.find("button").attr("data-idx", n);
      $(".contents").append(c);
   });
   setCart();
   if(search == "") return;
   $(".product-grid").each(function(){
      if($(this).find("h5").text().indexOf(search)>=0 || $(this).find("h5+span>p").text().indexOf(search)>=0){
         let reg = search.replace(new RegExp(/([\\\.\"\'])/, "g"), "\\$1");
         $(this).find("h5").html((_, html) => html.replace(new RegExp(reg, "g"), `<span class="highlight">${search}</span>`));
         $(this).find("h5+span>p").html((_, html) => html.replace(new RegExp(reg, "g"), `<span class="highlight">${search}</span>`));
      }else{
         $(this).remove();
      }
   });
   if($(".product-grid").length == 0)
      return $(".contents").html("검색된 앨범이 없습니다.");
}

function setCart(em=true){ //set cart table
   let pricesum = 0;
   let cartsum = 0;
   setItem();
   for(let i in cart)
      $(`.btn-xs[data-idx="${i}"]`).html(`<i class="fa fa-shopping-cart"></i> 추가하기 (${cart[i]}개)`);
   if(em)
      $("tbody").empty();
   for(let i in cart){
      pricesum += parseInt(data[i].price)*cart[i];
      cartsum += Number(cart[i]);
      if(em){
         let t = tGrid.clone();
         t.attr("data-idx", i);
         t.find("img").attr("src", "/images/"+data[i].albumJaketImage);
         t.find(".info h4").text(data[i].albumName);
         t.find(".info span:eq(0)>p").text(data[i].artist);
         t.find(".info span:eq(1)>p").text(data[i].release);
         t.find(".albumprice").text("\\ "+parseInt(data[i].price).toLocaleString());
         t.find(".albumqty input").val(cart[i]);
         t.find(".pricesum").text("\\ "+ (parseInt(data[i].price)*cart[i]).toLocaleString());
         $("tbody").prepend(t);
      }
   }
   $(".btn-lg:eq(1)").html(`<i class="fa fa-shopping-cart"></i> 쇼핑카트 <strong>${cartsum}</strong> 개 금액 ￦ ${pricesum.toLocaleString()}원</a>`);
   $(".totalprice span").html("\\"+pricesum.toLocaleString());
}