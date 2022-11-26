// noinspection UnnecessaryReturnStatementJS,JSUnusedGlobalSymbols,JSUnusedLocalSymbols,DuplicatedCode

class SolarSystem {
    static CreateNewSolarSystem() {
        const objectCount = GetRandomInt(1, 9);
        const newSolarSystem = new SolarSystem("S" + GetId(), GetRandomInt(3, 15));
        Star.CreateStar(newSolarSystem);
        for (let i = 1; i < objectCount; i++) {
            if (GetRandomInt(0, 100) < 60) {
                Asteroid.CreateAsteroid(newSolarSystem);
            } else if (GetRandomInt(0, 100) < 20) {
                Asteroid.CreateComet(newSolarSystem);
            } else {
                Planet.CreatePlanet(newSolarSystem);
            }
        }
        newSolarSystem.objects.forEach(object => {
            object.setButton(textController.CreateButton(object.name, newSolarSystem.solarSystemEvent, function () {
                newSolarSystem.TravelInSolarSystem(object);
            }));
        });
        return newSolarSystem;
    }

    constructor(name, travelTime) {
        this.name = name;
        this.objects = [];
        this.travelTime = travelTime;
        this.solarSystemEvent = new Event();
    }

    DisplaySolarSystem() {
        textController.AddLine();
        textController.AddEventText("Traveling to sector " + this.name + ". " + this.travelTime + " days have passed. There are " + this.objects.length + " objects in the sector. Here are the scan results: ");
        scienceShip.AddScience(this.objects.length);
        textController.NextLine();

        this.solarSystemEvent.DisplayEvent();
        textController.ResetExploreText();
    }

    AddObject(object) {
        this.objects.push(object);
    }

    TravelInSolarSystem(object) {
        if (object.visited || scienceShip.GetCurrentEventChain() != null)
            return;

        MinorTravelEventChain.GenerateMinorTravelEventChain(this, object);
    }

    LeaveSolarSystem() {
        if (scienceShip.GetCurrentEvent() != null) {
            scienceShip.GetCurrentEvent().PassEvent();
            scienceShip.SetCurrentEventChain(null);
        }
        this.solarSystemEvent.SetCurrentEventChain();
        this.solarSystemEvent.PassEvent();
        scienceShip.SetCurrentEventChain(null);
        /*       for (let i = 0; i < this.objects.length; i++) {
                 this.objects[i].missedObject();
              } */
    }
}

// noinspection JSUnusedGlobalSymbols
class Object {
    constructor(name, type, description, distance, science, solarSystem) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.distance = distance;
        this.science = science;
        this.visited = false;
        this.solarSystem = solarSystem;
        this.solarSystem.AddObject(this);
    }

    goTowards() {
        if (this.visited === false && this.solarSystem === scienceShip.GetCurrentSolarSystem()) {
            if (this.button.classList.contains("normalButtonText")) {
                this.button.classList.remove("normalButtonText");
                this.button.classList.add("inprogressButtonText");
            } else {
                throw "Trying to highlight a button as inprogress when it was already inprogress, missed or visited!";
            }
        }
    }

    arriveAt() {
        if (this.visited === false && this.solarSystem === scienceShip.GetCurrentSolarSystem()) {
            this.visited = true;
            scienceShip.AddScience(this.science);
            if (this.button.classList.contains("inprogressButtonText")) {
                this.button.classList.remove("inprogressButtonText");
                this.button.classList.add("visitedButtonText");
            } else {
                throw "Trying to highlight a button as visited when it was already inprogress, missed or visited!";
            }
            return true;
        }
        return false;
    }

    setButton(button) {
        this.button = button;
    }

    missedObject() {
        if (this.visited === false) {
            if (this.button.classList.contains("normalButtonText")) {
                this.button.classList.remove("normalButtonText");
                this.button.classList.add("missedButtonText");
            } else if (this.button.classList.contains("inprogressButtonText")) {
                this.button.classList.remove("inprogressButtonText");
                this.button.classList.add("missedButtonText");
            }
        }
    }

    GetName() {
        return this.name;
    }
}

class Star extends Object {
    static CreateStar(solarSystem) {
        let name;
        let description;
        const randomNumber = GetRandomInt(0, 5);
        if (randomNumber === 0) {
            name = "BlueStar";
            description = "blue";
        } else if (randomNumber === 1) {
            name = "RedStar";
            description = "red";
        } else if (randomNumber === 2) {
            name = "NeutronStar";
            description = "blue";
        } else if (randomNumber === 3) {
            name = "YellowStar";
            description = "yellow";
        } else if (randomNumber === 4) {
            name = "RedGiant";
            description = "red";
        }
        return new Star(name + GetId(), "star", description, GetRandomInt(2, 6), GetRandomInt(1, 8), solarSystem);
    }

    constructor(name, type, description, distance, science, solarSystem) {
        super(name, type, description, distance, science, solarSystem);
        this.description = description;
    }

    arriveAt() {
        if (super.arriveAt()) {
            ObjectEventChain.GenerateStarEventChain(this);
        }
    }
}

class Planet extends Object {
    static CreatePlanet(solarSystem) {
        let planet;
        let type;
        let name;
        let description;
        let surfaceDescription;
        let atmosphere = 0;
        let organisms = 0;
        if (Math.random() > 0.5) {
            atmosphere = Math.random();
        }
        if (atmosphere > 0.9) {
            type = "GasGiant";
            description = "orange";
            surfaceDescription = "gaseous";
        } else if (atmosphere > 0.7) {
            type = "Gas";
            description = "orange";
            surfaceDescription = "gaseous";
        } else {
            if (Math.random() > 0.7) {
                atmosphere = 0;
            } else if (Math.random() > 0.95) {
                organisms = Math.random();
            }
            const randomNumber = GetRandomInt(0, 5);
            if (randomNumber === 0) {
                type = "Rock";
                description = "gray";
                surfaceDescription = "rocky";
            } else if (randomNumber === 1) {
                type = "Ice"
                description = "blue";
                surfaceDescription = "cold, frozen";
            } else if (randomNumber === 2) {
                type = "Terran";
                description = "blue and green";
                surfaceDescription = "vibrant";
            } else {
                type = "Barren";
                description = "gray";
                surfaceDescription = "barren";
            }
        }
        name = type + "Planet";
        planet = new Planet(name + GetId(), "planet", type, description, surfaceDescription, GetRandomInt(4, 7), GetRandomInt(1, 20), solarSystem, atmosphere, organisms);
        return planet;
    }

    constructor(name, type, planetType, description, surfaceDescription, distance, science, solarSystem, atmosphere, organisms) {
        super(name, type, description, distance, science, solarSystem);
        this.planetType = planetType;
        this.surfaceDescription = surfaceDescription;
        this.atmosphere = atmosphere;
        this.organisms = organisms;
    }

    arriveAt() {
        if (super.arriveAt()) {
            ObjectEventChain.GeneratePlanetEventChain(this);
        }
    }
}

class Asteroid extends Object {
    static CreateAsteroid(solarSystem) {
        let name;
        let description;
        const randomNumber = GetRandomInt(0, 10);
        if (randomNumber <= 6) {
            name = "ChloriteAsteroid"
            description = "earthy";
        } else if (randomNumber <= 8) {
            name = "StonyAsteroid";
            description = "hard and metallic";
        } else if (randomNumber <= 10) {
            name = "IronAsteroid";
            description = "metallic";
        }
        return new Asteroid(name + GetId(), "asteroid", description, GetRandomInt(2, 5), GetRandomInt(1, 10), solarSystem);
    }

    static CreateComet(solarSystem) {
        let name;
        let description;
        name = "Comet";
        description = "cold, frozen";
        return new Asteroid(name + GetId(), "comet", description, GetRandomInt(2, 8), GetRandomInt(1, 10), solarSystem);
    }

    constructor(name, type, description, distance, science, solarSystem) {
        super(name, type, description, distance, science, solarSystem);
    }

    arriveAt() {
        if (super.arriveAt()) {
            ObjectEventChain.GenerateAsteroidEventChain(this);
        }
    }
}

class Ship {
    static GenerateShip(setArmedValue = 0, armed = false) {
        const randInt = GetRandomInt(15);
        let color = "";
        if (randInt < 4) {
            color = "black/gray";
        } else if (randInt < 5) {
            color = "black/blue";
        } else if (randInt < 9) {
            color = "silver";
        } else if (randInt < 10) {
            color = "metallic";
        } else if (randInt < 12) {
            color = "green";
        } else if (randInt < 14) {
            color = "dark red";
        }
        let armedValue = GetRandomInt(-4, 10) / 10;
        let armedDesc;
        const attitude = GetRandomInt(-100, 100) / 100;
        if (armedValue < 0) {
            armedValue = 0;
            armedDesc = "unarmed";
        } else if (armedValue < 0.3) {
            armedDesc = "lightly armed";
        } else if (armedValue < 0.6) {
            armedDesc = "medium armed";
        } else {
            armedDesc = "heavily armed";
        }
        if (armed)
            armedValue = setArmedValue;
        const size = GetRandomInt(0, 100) / 100;
        let sizeDesc = "";
        if (size < 30) {
            sizeDesc = "small";
        } else if (size < 70) {
            sizeDesc = "medium";
        } else if (size < 100) {
            sizeDesc = "large";
        }
        return new Ship(color, size, sizeDesc, armedDesc, armedValue, attitude, 1);
    }

    constructor(color, size, sizeDesc, armedDesc, armedValue, attitude, shipCount) {
        this.color = color;
        this.size = size;
        this.sizeDesc = sizeDesc;
        this.armedDesc = armedDesc;
        this.armedValue = armedValue;
        this.attitude = attitude;
        this.shipCount = shipCount;
    }
}

class ScienceShip extends Ship {
    constructor() {
        super("", "medium", "sleek", "unarmed", 0, 1, 1);
        this.name = "ScienceShip";
        this.crew = 10;
        this.shipIntegrity = 100;
        this.shipFuel = 250;
        this.maxFuel = 250;
        this.science = 0;
        this.place = "Station";
        this.days = 0;


        this.probesLaunched = 0;
        this.observingProbes = 0;
        this.solarSystems = [new SolarSystem("Outpost" + GetId(), 0)];
        this.currentSolarSystem = this.solarSystems[0];

        this.nextSolarSystem = null;
        this.currentEventChain = null;
    }

    AddScience(value) {
        this.science += value;
        textController.UpdateUIText();
    }

    GetScience() {
        return this.science;
    }

    AddCrew(value) {
        this.crew += value;
        if (this.crew < 0) {
            this.crew = 0;
        }
        textController.UpdateUIText();
    }

    GetCrew() {
        return this.crew;
    }

    /**
     * Returns true if the ship has enough fuel
     * Returns false if the ship does not have enough fuel
     */
    Refuel() {
        this.shipFuel = this.maxFuel;
        textController.UpdateUIText();
    }

    AddFuel(fuel) {
        this.shipFuel += fuel;
        if (this.shipFuel < 0) {
            this.shipFuel = 0;
            textController.UpdateUIText();
            return false;
        }
        if (this.shipFuel > this.maxFuel) {
            this.shipFuel = this.maxFuel;
        }
        textController.UpdateUIText();
        return true;
    }

    UseFuel(fuel) {
        this.shipFuel -= fuel;
        if (this.shipFuel < 0) {
            this.shipFuel = 0;
            textController.UpdateUIText();
            return false;
        }
        if (this.shipFuel > this.maxFuel) {
            this.shipFuel = this.maxFuel;
        }
        textController.UpdateUIText();
        return true;
    }

    GetFuel() {
        return this.shipFuel;
    }

    AddMaxFuel(capacity) {
        this.maxFuel += capacity;
    }

    GetMaxFuel() {
        return this.maxFuel;
    }

    /**
     * Returns true if the ship is not destroyed
     * Returns false if the ship is destroyed
     */
    AddShipIntegrity(value) {
        this.shipIntegrity += value;
        if (this.shipIntegrity < 0) {
            this.sipIntegrity = 0;
            textController.UpdateUIText();
            return false;
        }
        if (this.shipIntegrity > 100) {
            this.shipIntegrity = 100;
        }
        textController.UpdateUIText();
        return true;
    }

    GetShipIntegrity() {
        return this.shipIntegrity;
    }

    AddDays(days) {
        this.days += days;
        textController.UpdateUIText();
    }

    GetDays() {
        return this.days;
    }

    GetCurrentSolarSystem() {
        return this.currentSolarSystem;
    }

    GetNextSolarSystem() {
        return this.nextSolarSystem;
    }

    GetCurrentEventChain() {
        return this.currentEventChain;
    }

    GetCurrentEvent() {
        if (this.GetCurrentEventChain() == null)
            return null;
        return this.GetCurrentEventChain().GetCurrentEvent();
    }

    SetCurrentEventChain(newEventChain) {
        this.currentEventChain = newEventChain;
    }

    AddObservingProbe() {
        this.observingProbes += 1;
    }

    DestroyShip() {
        this.crew = 0;
        this.shipIntegrity = 0;
        textController.UpdateUIText();
    }

    Explore() {
        if (this.currentSolarSystem == null)
            return;
        this.currentSolarSystem.LeaveSolarSystem();
        this.currentSolarSystem = null;
        this.nextSolarSystem = SolarSystem.CreateNewSolarSystem();
        if (GetRandomInt(0, 10) < 4) {
            MajorTravelEventChain.GenerateMajorTravelEventChain();
        } else {
            this.ArriveAtNextSolarSystem(this.nextSolarSystem);
        }
    }

    ArriveAtNextSolarSystem() {
        this.AddDays(this.nextSolarSystem.travelTime);
        this.AddFuel(-this.nextSolarSystem.travelTime);
        this.currentSolarSystem = this.nextSolarSystem;
        this.nextSolarSystem = null;
        this.currentSolarSystem.DisplaySolarSystem();
        textController.UpdateUIText();
    }

    EndGame(reason, eventChain) {
        textController.CreateContinueText("End Exploration", eventChain, function () {
            scienceShip.GetCurrentEvent().PassEvent();
            textController.AddLine();
            textController.AddEventText("Alas, your adventure ends due to " + reason + ". After " + scienceShip.GetDays() + " days you managed to collect " + scienceShip.GetScience() + " science.");
            textController.NextLine();
            textController.AddEventText("A new ship is ready to begin the adventure, reload the page to start anew.");
        });
    }
}

class EventChain {
    constructor(setCurrentChain = false) {
        this.events = [];
        if (setCurrentChain)
            scienceShip.SetCurrentEventChain(this);
        this.acriveEvent = null;
    }

    AddEventToChain(event, setActiveEvent = false) {
        this.events.push(event);
        if (setActiveEvent)
            this.activeEvent = event;
    }

    static GetContinueToNextText(nextName) {
        const randInt = GetRandomInt(0, 3);
        if (randInt === 0) {
            return "Continue to " + nextName;
        }
        if (randInt === 1) {
            return "Continue on to " + nextName;
        }
        if (randInt === 2) {
            return "Continue on";
        }
    }

    static GenerateShipEvent(intro, continueText, eventChain) {
        const ship = Ship.GenerateShip();
        if (ship.attitude <= -0.7) {
            if (ship.armedValue <= 0) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    eventChain.AddEventToChain(new Event(), true);
                    textController.AddEventText(intro + " You find some weird scans of a lone ship. Should you approach the ship? Scan the ship? Or spend more fuel on avoiding them?");
                    textController.NextLine();
                    let approachShip = textController.CreateButton("Approach ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(approachShip, true);
                        textController.NextLine();
                        textController.AddEventText("You approach the " + ship.sizeDesc + " ship and find that it is a destroyed ship.");
                        textController.NextLine();
                        eventChain.AddEventToChain(new Event(), true);
                        let scanShip = textController.CreateButton("ScanShip", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(scanShip, true);
                            textController.NextLine();
                            let randInt = GetRandomInt(0, 1);
                            if (randInt === 0) {
                                let useFuel = GetRandomInt(12, 32);
                                scienceShip.AddFuel(-useFuel);
                                textController.AddEventText("You scan the ship and unexpectedly the ship's communications fire up and try to hack into your ship's computers. It unsuccessfully sabotages your ship but manages to waste " + useFuel + " units of fuel before it could be blocked. On the plus side it's hacking procedure gave you a lot of data to work with.");
                                scienceShip.AddScience(6, 12);
                                scienceShip.GetCurrentEventChain().EndEventChain();
                            }
                        });
                        let leaveShip = textController.CreateDefaultButton("Continue", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().PassEvent();
                            textController.NextLine();
                            textController.AddEventText("Although the ship is destroyed it could still have some functionality. You decide to continue on without investigating farther.");
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                    });
                    let scanShip = textController.CreateButton("Scan ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(scanShip, true);
                        textController.NextLine();
                        textController.AddEventText("You scan the ship from afar and find that it was in hibernation. Your computers found a tiny anomaly onboard the ship and immediately stopped processing the information that they received from the scanners. Instead they decide to display the information to you in order to prevent potential corruption from the data. Will you spend the time to search the data for yourself or will you risk the computational power of your onboard computers?");
                        textController.NextLine();
                        eventChain.AddEventToChain(new Event(), true);
                        let searchThroughData = textController.CreateButton("ManuallySearch", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(searchThroughData, true);
                            textController.NextLine();
                            let days = GetRandomInt(4, 15);
                            let science = GetRandomInt(4, 9);
                            scienceShip.AddScience(science);
                            scienceShip.AddDays(days);
                            textController.AddEventText("You spend " + days + " days manually searching through the data with only the help of some simple algorithms that you programed using a dumb computer. Although the computing power of your main computers would have greatly increased your speed on deciphering the data, you find that it is most likely some sort of a virus meant to protect the scout ship. You manually log what you can without the computer's help and gather" + science + " science.");
                            textController.CreateContinueText("Process data", eventChain, function () {
                                textController.NextLine();
                                let randInt = GetRandomInt(0, 3);
                                if (randInt === 0) {
                                    textController.AddEventText("You feed your onboard computers the information you deciphered. They find that the most logical conclusion is that it was a defense mechanism from an abandoned embassy ship traveling through space.");
                                } else if (randInt === 1) {
                                    textController.AddEventText("You feed your onboard computers the information you deciphered. They find that the most logical conclusion is that it was an abandoned survey ship on its way to the next solar system");
                                } else if (randInt === 2) {
                                    textController.AddEventText("You feed your onboard computers the information you deciphered. They find that the most logical conclusion is that it was an important civilian ship that must have missed its destination.");
                                }
                                scienceShip.GetCurrentEventChain().EndEventChain();
                            });
                        });
                        let reconnectComputers = textController.CreateButton("UseOnboardComputers", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(reconnectComputers, true);
                            textController.NextLine();
                            let science = -GetRandomInt(18, 29);
                            scienceShip.AddScience(science);
                            textController.AddEventText("You reconnect the computers to the scanners. A fraction of a second after they start processing the data one of the secondary computers blocks the connection to the scanners. After a full diagnosis check you find that while analyzing the data that was transferred the analysis computer was deleting your data banks instead. In a second all of your data would have been gone. However due to the safety checks from one of your secondary computers you only lost " + science + " science.");
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                        let continueOnButton = textController.CreateDefaultButton("Leave", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().PassEvent();
                            textController.NextLine();
                            textController.AddEventText("Anything could be lurking within that data, it would take too long to decipher. So you make sure to block all communications and leave the ship.");
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                    });
                    let avoidShipButton = textController.CreateButton("Avoid ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(avoidShipButton, true);
                        textController.NextLine();
                        let fuel = GetRandomInt(5, 12);
                        scienceShip.AddFuel(-fuel);
                        let randInt = GetRandomInt(0, 3);
                        if (randInt === 0) {
                            textController.AddEventText("A lone ship is a dangerous ship. You spend " + fuel + " extra fuel to avoid the ship.");
                        } else if (randInt === 1) {
                            textController.AddEventText("After confronting your options it appears that the ship might not be friendly after all. You spend " + fuel + " extra fuel to avoid the ship.");
                        } else if (randInt === 2) {
                            textController.AddEventText("Expecting the ship to be hostile, you spend " + fuel + " extra fuel to avoid the ship.");
                        }
                        scienceShip.GetCurrentEventChain().EndEventChain();
                    });
                    let continueOnButton = textController.CreateDefaultButton(continueText, eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().PassEvent();
                        textController.NextLine();
                        textController.AddEventText("You continue on without communicating with the ship.");
                        scienceShip.GetCurrentEventChain().EndEventChain();
                    });
                }
                return;
            }
            if (ship.armedValue <= 0.3) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    eventChain.AddEventToChain(new Event(), true);
                    textController.AddEventText("While on route to the next solar system your computers blare multiple warnings of an unknown ship quickly closing in. The ship does not send any communications, it could very well be hostile.");
                    let approachShip = textController.CreateButton("Approach ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(approachShip, true);
                        textController.NextLine();
                        textController.AddEventText("The ship comes at you at such a speed that your computers calculate that there is no need to change course. So why not save a little fuel?");
                        textController.CreateContinueText("Wait", eventChain, function () {
                            textController.NextLine();
                            textController.AddEventText("As your time until approach decreases the ship releases a cloud of debris. Once the cloud is released the ship maneuvers out of the cloud and adjusts its velocity to miss you. Most of the debris however collide with your ship.");
                            textController.CreateContinueText("Uh oh", eventChain, function () {
                                textController.NextLine();
                                let damage = GetRandomInt(15, 52);
                                scienceShip.AddShipIntegrity(-damage);
                                textController.AddEventText("After the collision your ship increases its velocity to discourage another pass from the hostile ship. Luckily it decides against continuing it's assault and leaves.");
                                textController.NextLine();
                                textController.AddEventText("After safely away a self diagnosis finds that your ship is down to " + scienceShip.GetShipIntegrity() + "% integrity.");
                                scienceShip.GetCurrentEventChain().EndEventChain();
                            });
                        });
                    });
                    let scanShip = textController.CreateButton("Scan ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(scanShip, true);
                        let fuelTaken = GetRandomInt(2, 8);
                        scienceShip.AddFuel(-fuelTaken);
                        textController.AddEventText("Your computers run a quick scan of the ship and find that it is not armed with your conventional weapons. However they could prove just as dangerous. The computers then calculate a series of maneuvers that will prevent the ship from being able to hit your ship using a total of " + fuelTaken + " fuel.");
                        scienceShip.GetCurrentEventChain().EndEventChain();
                    });
                    let avoidShip = textController.CreateButton("Avoid ship", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(avoidShip, true);
                        let fuelUsed = GetRandomInt(3, 9);
                        textController.AddEventText("Your computers calculate a simple maneuver that can prevent the ship from closing the distance. The ship expends " + fuelUsed + " fuel executing the maneuver.s");
                        scienceShip.GetCurrentEventChain().EndEventChain();
                    });
                    let continueOn = textController.CreateDefaultButton(continueText, eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().PassEvent();
                        textController.NextLine();
                        textController.AddEventText("You continue on without interacting with the potentially hostile ship.");
                        scienceShip.GetCurrentEventChain().EndEventChain();
                    });
                }
                return;
            }
            if (ship.armedValue <= 0.6) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    ship.shipCount = GetRandomInt(4, 21);
                    eventChain.AddEventToChain(new Event(), true);
                    textController.AddEventText("On the way to the next solar system your sensors detect a fleet of " + ship.shipCount + " " + ship.sizeDesc + " sized ships traveling through space. According to their energy signatures they are armed with a variety of " + ship.armedDesc + " weapon systems.");
                    let observeFleet = textController.CreateButton("Observe fleet", eventChain.GetCurrentEvent(), function () {
                        scienceShip.GetCurrentEvent().HighlightButton(observeFleet, true);
                        eventChain.AddEventToChain(new Event(), true);
                        textController.AddEventText("You observe the fleets movements as they continue on. However you notice that a detachment of fighters seems to have launched from the fleet towards your ship. Your computer blares a warning that they are armed and will come into range shortly.");
                        let communicate = textController.CreateButton("Communicate", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(communicate, true);
                            eventChain.AddEventToChain(new Event(), true);
                            textController.AddEventText("You attempt to communicate with the fleet and the fleet tries to communicate back to you. However due to translation complications deciphering what they are saying is taking longer than usual and the fighters are closing in. Once they are close enough there won't be a chance for escape.");
                            let continueCommunicate = textController.CreateButton("Continue communications", eventChain.GetCurrentEvent(), function () {
                                scienceShip.GetCurrentEvent().HighlightButton(continueCommunicate, true);
                                let damage = GetRandomInt(10, 90);
                                textController.AddEventText("Just before you finish figuring out the code to communicate with the fleet the fighters enter weapon range. However they don't fire right away but close in a little more before unleashing their deadly weapons. Your ship takes a beating of " + damage + " damage.");
                                if (scienceShip.AddShipIntegrity(-damage)) {
                                    textController.AddEventText("Escape!", function () {
                                        let fuel = GetRandomInt(5, 11);
                                        if (scienceShip.AddFuel(-fuel)) {
                                            textController.AddEventText("Your computers don't even wait for your orders, they gun the engines and what your ship lacks in armor, it makes up with speed. The weapons begin to tear through your hull, however miraculously your ship is still in one piece as your engines bring your ship out of range. The fighters run out out their fuel reserves and you make it away using up " + fuel + " units of fuel.");
                                            textController.CreateContinueText("Lucky!", eventChain, function () {
                                                textController.AddEventText("With the encounter over your ship runs a self diagnosis check. Integrity at " + scienceShip.GetShipIntegrity() + "%. Fuel at " + scienceShip.GetFuel() + ".");
                                                scienceShip.GetCurrentEventChain().EndEventChain();
                                            });
                                        } else {
                                            textController.AddEventText("Your ship begins to fire its engine as the weapons tear through your hull. You start to gain ground on the fighters when your fuel tanks run out.");
                                            textController.CreateContinueText("Crap", eventChain, function () {
                                                scienceShip.DestroyShip();
                                                scienceShip.EndGame("the swarm of fighters", eventChain);
                                            });
                                        }
                                    });
                                } else {
                                    scienceShip.DestroyShip();
                                    textController.AddEventText("Your hull rips apart as the weapon systems of the fighters light up your ship. Little remains from your ship.");
                                    scienceShip.EndGame("the swarm of fighters", eventChain);
                                }
                            });
                            let avoidFighters = textController.CreateButton("Avoid fighters", eventChain.GetCurrentEvent(), function () {
                                scienceShip.GetCurrentEvent().HighlightButton(avoidFighters, true);
                                textController.AddEventText("You instruct your ship to cease communications and fire the engines. This is surely a trap.");

                                textController.CreateContinueText("Fire Engines!", eventChain, function () {
                                    let useFuel = GetRandomInt(4, 8);
                                    if (scienceShip.AddFuel(-useFuel)) {
                                        textController.AddEventText("Your engines fire, outrunning the fighters. Forcing them to turn back. A close call. " + useFuel + " units of fuel were used in this maneuver.");
                                    } else {
                                        textController.AddEventText("Your engines fire, however they cut short due to a lack of fuel.")
                                        textController.CreateContinueText("Crap", eventChain, function () {
                                            scienceShip.DestroyShip();
                                            textController.AddEventText("The fighters swam you and your ship is blasted to pieces.");
                                            scienceShip.EndGame("the swarm of fighters", eventChain);
                                        })
                                    }
                                });
                            });
                            let continueOn = textController.CreateDefaultButton("Continue on", eventChain.GetCurrentEvent(), function () {
                                scienceShip.GetCurrentEvent().PassEvent();
                                let damage = GetRandomInt(40, 60);
                                textController.AddEventText("You continue on as normal. However the fighters continue to close on you. Once they are in firing range their weapon systems begin to light your ship up. In a desperate attempt to escape your ship attempts to flee.");
                                if (scienceShip.AddShipIntegrity(-damage)) {
                                    textController.NextLine();
                                    textController.AddEventText("The weapons tear through your hull, however miraculously your ship is still in one piece. Leaving you with " + scienceShip.shipIntegrity + " ship integrity left.");
                                    textController.CreateContinueText("Escape!", eventChain, function () {
                                        let fuel = GetRandomInt(5, 11);
                                        if (scienceShip.AddFuel(-fuel)) {
                                            textController.AddEventText("Your computers don't even wait for your orders, they gun the engines. what your ship lacks in armor, it makes up with speed. The fighters run out out their fuel reserves and you make it away using up " + fuel + " units of fuel.")
                                            textController.CreateContinueText("Phew!", eventChain, function () {
                                                textController.AddEventText("With the encounter over your ship runs a self diagnosis check. Integrity at " + scienceShip.GetShipIntegrity() + "%. Fuel at " + scienceShip.GetFuel() + ".");
                                                scienceShip.GetCurrentEventChain().EndEventChain();
                                            });
                                        } else {
                                            scienceShip.DestroyShip();
                                            textController.AddEventText("Your hull rips apart as the weapon systems of the fighters light up your ship. Little remains from your ship.");
                                            scienceShip.EndGame("the swarm of fighters", eventChain);
                                        }
                                    });
                                } else {
                                    scienceShip.DestroyShip();
                                    textController.AddEventText("Your hull rips apart as the weapon systems of the fighters light up your ship. Little remains from your ship.");
                                    scienceShip.EndGame("the swarm of fighters", eventChain);
                                }
                            });
                        });
                    });
                    let scanFleet = textController.CreateButton("Scan fleet", eventChain.GetCurrentEvent(), function () {
                        alert("not implemented");
                    });
                    let evadeFleet = textController.CreateButton("Evade fleet", eventChain.GetCurrentEvent(), function () {
                        alert("not implemented");
                    });
                    let continueOn = textController.CreateDefaultButton(continueText, eventChain.GetCurrentEvent(), function () {
                        alert("not implemented");
                    });
                }
                return;
            }
            if (ship.armedValue <= 100) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            throw new Error("No ship event was picked");
        }
        if (ship.attitude <= -0.3) {
            if (ship.armedValue <= 0) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.3) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.6) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 100) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            throw new Error("No ship event was picked");
        }
        if (ship.attitude <= 0.3) {
            if (ship.armedValue <= 0) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.3) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.6) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 100) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            throw new Error("No ship event was picked");
        }
        if (ship.attitude <= 0.7) {
            if (ship.armedValue <= 0) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.3) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.6) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 100) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            throw new Error("No ship event was picked");
        }
        if (ship.attitude <= 1) {
            if (ship.armedValue <= 0) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.3) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 0.6) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            if (ship.armedValue <= 100) {
                let randInt = GetRandomInt(0, 1);
                if (randInt === 0) {
                    textController.AddEventText("Generate random ship event with an attitude of " + ship.attitude + " and an armed value of " + ship.armedValue);
                    scienceShip.GetCurrentEventChain().EndEventChain();
                }
                return;
            }
            throw new Error("No ship event was picked");
        }
    }

    GetCurrentEvent() {
        return this.activeEvent;
    }

    EndEventChain() {
        throw new Error("Event chain was not inherited from.");
    }
}

class Event {
    constructor(setCurrentEvent = false) {
        this.buttons = [];
        if (setCurrentEvent) {
            this.SetCurrentEventChain();
        }
    }

    AddButton(button) {
        this.buttons.push(button);
    }

    DisplayEvent() {
        for (let i = 0; i < this.buttons.length; i++) {
            textController.storyElement.appendChild(this.buttons[i]);
        }
        textController.ScrollToBottom();
    }

    DisplayEventWithFunction(text) {
        for (let i = 0; i < this.buttons.length; i++) {
            textController.storyElement.appendChild(this.buttons[i]);
        }
        textController.exploreText.innerHTML = "| " + text + " |";
        textController.ScrollToBottom();
        return textController.exploreText;
    }

    HighlightButton(button, passEvent = false) {
        if (button.classList.contains("normalButtonText")) {
            button.classList.remove("normalButtonText");
            button.classList.add("visitedButtonText");
        } else {
            throw "Trying to highlight a button as green when it was already highlighted or missed!";
        }
        if (passEvent) {
            this.PassEvent();
        }
    }

    PassEvent() {
        if (scienceShip.GetCurrentEvent() !== this) {
            alert("Trying to pass a non current event")
        }
        this.AbortEvent();
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].classList.contains("normalButtonText")) {
                this.buttons[i].classList.remove("normalButtonText");
                this.buttons[i].classList.add("missedButtonText");
            }
        }
        textController.AbortExploreText();
    }

    SetCurrentEventChain() {
        scienceShip.SetCurrentEventChain(this);
    }

    GetCurrentEvent() {
        return this;
    }

    AbortEvent() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].abortController.abort();
        }
    }

    EndEventChain() {
        this.PassEvent();
        scienceShip.SetCurrentEventChain(null);
    }
}

class MajorTravelEventChain extends EventChain {
    static GenerateMajorTravelEventChain() {
        textController.AddLine();
        const randInt = GetRandomInt(0, 11);
        if (randInt <= 3) {
            let randInt = GetRandomInt(0, 10);
            if (randInt < 8) {
                scienceShip.AddScience(GetRandomInt(2, 4));
                const fuel = GetRandomInt(1, 3);
                scienceShip.AddFuel(-fuel);
                textController.AddEventText("While traveling to " + scienceShip.GetNextSolarSystem().name + " you observe a black hole in the distance and send a simple probe into it.");
                textController.ContinueOnMajorEvent();
                return;
            }
            if (randInt < 9) {
                scienceShip.AddScience(GetRandomInt(4, 13));
                const newDays = GetRandomInt(3, 8);
                scienceShip.AddDays(newDays);
                scienceShip.AddFuel(-newDays);
                textController.AddEventText("While traveling to " + scienceShip.GetNextSolarSystem().name + " you pass by a black hole. The close encounter requires for you to spend " + newDays + " extra fuel and time avoiding it but you also obtain some data from it.");
                textController.ContinueOnMajorEvent();
                return;
            }
        }
        if (randInt <= 5) {
            scienceShip.AddCrew(-1);
            textController.AddEventText("On your way to " + scienceShip.GetNextSolarSystem().name + " one of your crew members dies of radiation poisoning. You knew it was happening for a time now but the question was when.");
            textController.ContinueOnMajorEvent();
            return;
        }
        if (randInt <= 9) {
            let randInt = GetRandomInt(0, 2);
            if (randInt === 0) {
                EventChain.GenerateShipEvent("Venturing to solar system " + scienceShip.GetNextSolarSystem().name, EventChain.GetContinueToNextText(scienceShip.GetNextSolarSystem().name), new MajorTravelEventChain(true));
            }
            if (randInt === 1) {
                EventChain.GenerateShipEvent("While on route to " + scienceShip.GetNextSolarSystem().name, EventChain.GetContinueToNextText(scienceShip.GetNextSolarSystem().name), new MajorTravelEventChain(true));
            }
            return;
        }
        const eventChain = new EventChain(true);
        textController.AddEventText("It Seems that you have reached the end of the universe. It's time to head back to Earth.");
        scienceShip.AddScience(GetRandomInt(1, scienceShip.solarSystems.length));
        textController.CreateContinueText("End journey", eventChain, function () {
            if (scienceShip.GetCurrentEvent() === eventChain.events[0]) {
                scienceShip.GetCurrentEvent().PassEvent();
                textController.NextLine();
                const fuelToUse = GetRandomInt(scienceShip.solarSystems.length, scienceShip.solarSystems.length * 2);
                if (scienceShip.AddFuel(-fuelToUse)) {
                    textController.AddEventText("Your computers calculate that you have enough fuel to reach Earth.");
                    scienceShip.EndGame("the end of the galaxy", eventChain);
                } else {
                    textController.AddEventText("Sadly your computers calculate that there isn't enough fuel to make it back to Earth. You prepare the last of your ship to hibernate until some help could arrive.");
                    scienceShip.EndGame("lack of fuel", eventChain);
                }
                textController.CreateContinueText("Reload Page", eventChain, function () {
                    location.reload();
                });
            }
        });
    }

    EndEventChain() {
        textController.ContinueOnMajorEvent();
    }
}

class MinorTravelEventChain extends EventChain {
    static GenerateMinorTravelEventChain(solarSystem, object) {
        object.goTowards();
        const eventChain = new MinorTravelEventChain(true);
        eventChain.nextObject = object
        scienceShip.AddFuel(-object.distance);
        scienceShip.AddDays(object.distance);
        let randInt = GetRandomInt(-10, 1);
        if (randInt < -11) {
            textController.NextLine();
            textController.AddEventText("You decide to travel towards " + object.name + " for " + object.distance + " days.");
            eventChain.EndEventChain();
            return;
        }
        if (randInt <= 0) {
            scienceShip.AddScience(GetRandomInt(2, 5));
            textController.NextLine();
            textController.AddEventText("While traveling through " + solarSystem.name + " you pass by a smaller asteroid that you did not find before and scan it for its data.");
            eventChain.EndEventChain();
            return;
        }
        if (randInt <= 2) {
            scienceShip.AddScience(GetRandomInt(2, 5));
            textController.NextLine();
            EventChain.GenerateShipEvent("While traveling through " + solarSystem.name + " you encounter the signature of a ship.", EventChain.GetContinueToNextText(object.name), eventChain);
            return;
        }
        if (randInt <= 2) {
            scienceShip.AddScience(GetRandomInt(2, 5));
            textController.NextLine();
            EventChain.GenerateShipEvent("While traveling through " + solarSystem.name + " you encounter the signature of a ship.", EventChain.GetContinueToNextText(object.name), eventChain);
            return;
        }
    }

    EndEventChain() {
        textController.ContinueOnMinorEvent(this.nextObject);
    }
}

class ObjectEventChain extends EventChain {
    static GenerateStarEventChain(star) {
        const eventChain = new ObjectEventChain(true);
        const randInt = GetRandomInt(-10, 2);
        if (randInt <= 0) {
            textController.AddEventText("You take the scans of " + star.name + " but find no anomalies and add it to your data banks.");
            scienceShip.GetCurrentEventChain().EndEventChain();
            return;
        }
        if (randInt <= 1) {
            scienceShip.AddShipIntegrity(-GetRandomInt(4, 12));
            scienceShip.AddScience(GetRandomInt(1, 4));
            textController.AddEventText("As you take scans of " + star.name + " an unexpected solar flare from the" + star.description + " star and temporarily heats your ship to more than it can handle. You log the abrupt change for extra science.");
            scienceShip.GetCurrentEventChain().EndEventChain();
            return;
        }
    }

    static GeneratePlanetEventChain(planet) {
        textController.NextLine();
        let eventChain = new ObjectEventChain(true);
        if (planet.planetType === "GasGiant") {
            let randInt = GetRandomInt(0, 5);
            if (randInt <= 3) {
                scienceShip.AddFuel(GetRandomInt(8, 16));
                textController.AddEventText("As you scan " + planet.name + " you find that you can convert some of the gasses into fuel.");
                scienceShip.GetCurrentEventChain().EndEventChain();
                return;
            }
            if (randInt <= 4) {
                eventChain.AddEventToChain(new Event(), true);
                scienceShip.AddFuel(GetRandomInt(8, 16));
                textController.AddEventText("As you scan " + planet.name + " you find that the gas around the planet may have some interesting properties. Should you send a probe into it?");
                let sendProbe = textController.CreateButton("Send Probe", eventChain.GetCurrentEvent(), function () {
                    scienceShip.GetCurrentEvent().HighlightButton(sendProbe, true);
                    let randInt = GetRandomInt(0, 3);
                    if (randInt <= 2) {
                        textController.AddEventText("Sadly the anomaly was from a sensor malfunction. You repair the sensor and don't find any more anomalies on the planet.");
                    } else if (randInt <= 3) {
                        textController.AddEventText("Your scanners document the properties of the gas and find that it is identical to the air required to breath but exerts a lower force from air pressure. Using the gas instead of your current air mixture would increase the overall integrity of your ship. The extraction process will be risky but may be worth it.");
                        eventChain.AddEventToChain(new Event(), true);
                        let extractGasses = textController.CreateButton("Extract gasses", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(extractGasses, true);
                            let fuelUsed = GetRandomInt(2, 6);
                            if (scienceShip.UseFuel(fuelUsed)) {
                                textController.AddEventText("");
                            }
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                        let logProperties = textController.CreateButton("Log properties", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().HighlightButton(logProperties, true);
                            scienceShip.AddScience(GetRandomInt(9, 14));
                            textController.AddEventText("It would be too risky to collect the gas. Instead your computers log the properties of the gas and add it to the database.");
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                        let alertTextButton = textController.CreateDefaultButton("Continue on", eventChain.GetCurrentEvent(), function () {
                            scienceShip.GetCurrentEvent().PassEvent();
                            scienceShip.GetCurrentEventChain().EndEventChain();
                        });
                    }
                    scienceShip.GetCurrentEventChain().EndEventChain();
                });
                let saveData = textController.CreateButton("Save the data", eventChain.GetCurrentEvent(), function () {
                    scienceShip.GetCurrentEvent().HighlightButton(saveData, true);
                    scienceShip.AddScience(GetRandomInt(7, 14));
                    textController.AddEventText("The computers analyze the data as much as then can before you continue on.");
                    scienceShip.GetCurrentEventChain().EndEventChain();
                });
                let continueOn = textController.CreateDefaultButton("ContinueOn", eventChain.GetCurrentEvent(), function () {
                    scienceShip.GetCurrentEvent().PassEvent();
                    textController.AddEventText("You leave the anomaly without investigating farther.");
                    scienceShip.GetCurrentEventChain().EndEventChain();
                });
                return;
            }
            return;
        }
        if (planet.planetType === "Gas") {
            let randInt = GetRandomInt(0, 1);
            if (randInt <= 1) {
                scienceShip.AddFuel(GetRandomInt(8, 16));
                textController.AddEventText("As you scan " + planet.name + " you find that you can convert some of the gasses into fuel.");
                scienceShip.GetCurrentEventChain().EndEventChain();
                return;
            }
            if (randInt <= 3) {
            }
        }
        if (planet.planetType === "Rocky") {
        }
        if (planet.planetType === "Ice") {
        }
        if (planet.planetType === "Terran") {
        }
        if (planet.planetType === "Barren") {
        }
        textController.AddEventText("You arrive at " + planet.planetType + " and find that it is your average planet.");
        scienceShip.GetCurrentEventChain().EndEventChain();
    }

    static GenerateAsteroidEventChain(asteroid) {
        const eventChain = new ObjectEventChain(true);
        const randInt = GetRandomInt(-10, 1);
        if (randInt <= 0) {
            textController.NextLine();
            textController.AddEventText("You take scans of " + asteroid.name + " and add it to your data banks. Nothing unusual was found.");
            scienceShip.GetCurrentEventChain().EndEventChain();
            return;
        }
        if (randInt <= 2) {
            textController.NextLine();
            textController.AddEventText("As you approach " + asteroid.name + " your scans show that the " + asteroid.type + " is easily approachable and the ship takes a sample of " + asteroid.name + ".");
            scienceShip.AddScience(GetRandomInt(5, 12));
            scienceShip.GetCurrentEventChain().EndEventChain();
            return;
        }
        textController.NextLine();
        textController.AddEventText("As you near the " + asteroid.type + " you find a blank in your scans. It appears " + asteroid.name + " does not exist.");
        scienceShip.GetCurrentEventChain().EndEventChain();
        return;
    }

    static GenerateCometEventChain(comet) {
        const eventChain = new ObjectEventChain(true);
        scienceShip.GetCurrentEventChain().EndEventChain();
        textController.AddEventText("Generating comet event");
        return;
    }

    static GenerateProbeReturnEvent(object) {
        const returnProbe = document.createElement("button");
        const continueObserving = document.createElement("button");
        const newEvent = new Event([returnProbe, continueObserving]);
        scienceShip.SetCurrentEventChain(newEvent);
        returnProbe.innerText = "Return probe";
        returnProbe.addEventListener("click", function () {
            scienceShip.GetCurrentEvent().PassEvent();
            returnProbe.style.color = "green";
            scienceShip.AddFuel(-GetRandomInt(1, 2));
            const randomNumber = GetRandomInt(0, 10);
            if (randomNumber <= 7) {
                textController.AddEventText("The probe successfully returns from the " + object.description + " " + object.type + ". You refuel and continue on with your mission.");

            } else if (randomNumber === 8) {
                scienceShip.AddScience(0, 3);
                textController.AddEventText("As your probe returns, it is hit by a micro asteroid and loses all functionality. At least you got some data on it's collision.");
            } else {
                scienceShip.AddShipIntegrity(-GetRandomInt(4, 8));
                textController.AddEventText("As the probe nears the ship from the " + object.type + " it loses control and slams into the ship, destroying the probe and some of the ship in the process");
            }
            scienceShip.SetCurrentEventChain(null);
        })
        continueObserving.innerText = "Keep probe observing the " + object.type;
        continueObserving.addEventListener("click", function () {

        })
        scienceShip.SetCurrentEventChain(null);
    }

    EndEventChain() {
        textController.ContinueOnObjectEvent();
    }
}

class TextController {
    constructor() {
        this.storyElement = document.getElementById("story");
        this.exploreText = document.getElementById("exploreText");
        this.topBarText = document.getElementById("topBarText");
        this.locationText = document.getElementById("currentLocation");
        this.exploreTextAbortController = null;

        this.ResetExploreText();
        this.UpdateUIText();
    }

    UpdateUIText() {
        this.topBarText.innerHTML = "Crew: " + scienceShip.GetCrew() + " | ShipIntegrity: " + scienceShip.GetShipIntegrity() + "% | ShipFuel: " + scienceShip.GetFuel() + "/" + scienceShip.GetMaxFuel() + " | Science: " + scienceShip.GetScience() + " | Day: " + scienceShip.GetDays();
        let place;
        if (scienceShip.GetCurrentSolarSystem() != null) {
            place = scienceShip.GetCurrentSolarSystem().name;
        } else {
            place = "Empty Space";
        }
        this.locationText.innerHTML = place;
        this.ScrollToBottom();
    }

    ScrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    CreateButton(name, event, onClickFunction) {
        let newButton = document.createElement("button");
        newButton.classList.add("normalButtonText");
        event.AddButton(newButton);
        newButton.innerText = name;
        newButton.abortController = new AbortController();
        newButton.addEventListener("click", onClickFunction, {
            signal: newButton.abortController.signal
        });
        return newButton;
    }

    CreateDefaultButton(name, event, onClickFunction) {
        this.CreateNewExploreTextAbortController();
        return event.DisplayEventWithFunction(name).addEventListener("click", onClickFunction, {
            signal: this.GetExploreTextAbortController().signal
        });
    }

    CreateContinueText(name, eventChain, onClickFunction) {
        if (eventChain == null) {
            throw new Error("EventChain is not set");
        }
        eventChain.AddEventToChain(new Event(), true);
        this.CreateNewExploreTextAbortController();
        eventChain.GetCurrentEvent().DisplayEventWithFunction(name).addEventListener("click", onClickFunction, {
            signal: this.GetExploreTextAbortController().signal
        });
    }

    AddEventText(text) {
        const newParagraph = document.createElement("p");
        const eventText = document.createTextNode(text);
        this.storyElement.appendChild(newParagraph);
        newParagraph.appendChild(eventText);
        this.UpdateUIText();
    }

    EndMajorTravelEvent() {
        this.UpdateUIText();
        scienceShip.SetCurrentEventChain(null);
        scienceShip.ArriveAtNextSolarSystem();
    }

    ContinueOnMajorEvent() {
        this.exploreText.innerHTML = "| Continue on |";
        this.CreateNewExploreTextAbortController();
        this.exploreText.addEventListener("click", function () {
            textController.ResetExploreText();
            textController.EndMajorTravelEvent();
        }, {
            signal: this.GetExploreTextAbortController().signal
        });
        this.UpdateUIText();
    }

    ContinueOnMinorEvent(nextObject) {
        this.exploreText.innerHTML = "| Continue to " + nextObject.GetName() + " |";
        this.CreateNewExploreTextAbortController();
        this.exploreText.addEventListener("click", function () {
            textController.AbortExploreText();
            nextObject.arriveAt();
        }, {
            signal: this.GetExploreTextAbortController().signal
        });
        this.UpdateUIText();
    }

    ContinueOnObjectEvent() {
        this.exploreText.innerHTML = "| Leave |";
        this.CreateNewExploreTextAbortController();
        this.exploreText.addEventListener("click", function () {
            textController.ResetExploreText();
            scienceShip.SetCurrentEventChain(null);
        }, {
            signal: this.GetExploreTextAbortController().signal
        });
        this.UpdateUIText();
    }

    ResetExploreText() {
        this.exploreText.innerHTML = "| Explore |";
        this.CreateNewExploreTextAbortController();
        this.exploreText.addEventListener("click", function () {
            scienceShip.Explore();
        }, {
            signal: this.GetExploreTextAbortController().signal
        });
    }

    CreateNewExploreTextAbortController() {
        this.AbortExploreText();
        this.exploreTextAbortController = new AbortController();
    }

    GetExploreTextAbortController() {
        return this.exploreTextAbortController;
    }

    AbortExploreText() {
        if (this.exploreTextAbortController != null) {
            this.exploreTextAbortController.abort();
            this.exploreTextAbortController = null;
        }
    }

    AddLine() {
        const line = document.createElement("hr");
        this.storyElement.appendChild(line);
    }

    NextLine() {
        const divider = document.createElement("div");
        this.storyElement.appendChild(divider);
    }
}

function GetId() {
    return GetRandomInt(1000, 9999);
}

function GetRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

let scienceShip = new ScienceShip();
let textController = new TextController();
