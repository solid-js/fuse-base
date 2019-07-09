#!/bin/bash
echo ""
echo "          Internal server                       Production server"
echo "     "
echo "     +------------+-----------+          +-------------+----------------+"
echo "     |   master   |    qa     |          |   staging   |   production   |"
echo "     +------------+-----------+          +-------------+----------------+"
echo "     "
echo "        Working     Internal                 Client         Online"
echo "        branch      review                   review         version"
echo "     "
echo "           +                                    ^"
echo "           |                                    |"
echo "           +------------------------------------+"
echo ""
echo "This script will merge master into staging and start a build."
echo "If the build is successful, the branch will be deployed to the production server."
echo ""
read -r -p "Are you sure? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

echo "> Merging master to staging...";
git fetch . master:staging

echo "> Pushing staging..."
git push origin staging
