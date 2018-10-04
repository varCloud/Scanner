import { OdooJsonRpc } from "../../services/odoojsonrpc";
import { Component } from "@angular/core";
import {
  AlertController,
  LoadingController,
  NavController,
  NavParams
} from "ionic-angular";
import { Utils } from "../../services/utils";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	 url : string= "http://45.58.40.30:8068";
   Objetos : string="xmlrpc/2/object";
   common : string= "xmlrpc/2/common";
   db : string= "demofe";
   username : string= "demo";
   password : string= "$demo123*";
   private listForProtocol: Array<{
              protocol: string;
            }> = [];
  public perfectUrl: boolean = false;
  public odooUrl;
  public selectedProtocol;
  private dbList: Array<{
    dbName: string;
  }> = [];

  private selectedDatabase;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private odooRpc: OdooJsonRpc,
    private utils: Utils
  ) {
    this.listForProtocol.push({
      protocol: "http"
    });
    this.listForProtocol.push({
      protocol: "https"
    });
    this.odooUrl = this.url;
  }

  public checkUrl() {
    this.utils.presentLoading("Please Wait");
    this.odooRpc.init({
      odoo_server:this.url,
      http_auth: "username:password" // optional
    });

    this.odooRpc
      .getDbList()
      .then((dbList: any) => {
        this.perfectUrl = true;
        this.utils.dismissLoading();
        this.fillData(dbList);
      })
      .catch((err: any) => {
        this.utils.presentAlert("Error", "You Entered a wrong Odoo URL -> "+JSON.stringify(err), [
          {
            text: "Ok"
          }
        ]);
        this.utils.dismissLoading();
      });
  }

  public fillData(res: any) {
    let body = JSON.parse(res._body);
    let json = body["result"];
    this.dbList.length = 0;
    for (var key in json) {
      this.dbList.push({ dbName: json[key] });
    }
  }

  private login() {
    this.utils.presentLoading("Please wait", 0, true);
    this.odooRpc
      .login(this.selectedDatabase, this.username, this.password)
      .then((res: any) => {
        let logiData: any = JSON.parse(res._body)["result"];
        logiData.password = this.password;
        localStorage.setItem("token", JSON.stringify(logiData));
        this.navCtrl.setRoot(HomePage);
      })
      .catch(err => {
        this.utils.dismissLoading();
        this.utils.presentAlert(
          "Error",
          "Username or password must be incorrect",
          [
            {
              text: "Ok"
            }
          ]
        );
      });
  }
}
